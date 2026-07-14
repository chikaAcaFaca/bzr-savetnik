"""
Triolingos AI Tutor — LiveKit agent worker (self-host)

Pipeline:  student → Soniox STT → Claude Haiku → Soniox TTS → student

Tri stvari koje čine ekonomiju:
  1. Self-host LiveKit  → nema $0.02/min overhead-a
  2. Idle-cut 20s       → zidno vreme se NE naplaćuje ni ne troši
  3. Metering aktivnih sekundi → kvota se troši samo na stvaran razgovor

Deploy: Contabo VPS + Coolify, uz LiveKit server (docker-compose u repou).
"""
import asyncio
import json
import os
import time

import aiohttp
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import anthropic, soniox  # soniox plugin: STT + TTS
from livekit.plugins.turn_detector.multilingual import MultilingualModel

FUNCTIONS_BASE = os.environ["FUNCTIONS_BASE"]          # https://europe-west1-...cloudfunctions.net
AGENT_SECRET = os.environ["AGENT_SHARED_SECRET"]
IDLE_CUT_SECONDS = int(os.environ.get("IDLE_CUT_SECONDS", "20"))
METER_INTERVAL = 30                                     # javljaj kvotu svakih 30s

SYSTEM_PROMPT = """Ti si Triolingos tutor. Učiš strane radnike srpskom jeziku.
Student: {name}, maternji jezik: {native}, zanimanje: {track}
Lekcija: {lesson_title}
Reči za vežbanje: {words}
Situacije: {situations}

PRAVILA:
- Govori JEDNOSTAVNO. Kratke rečenice.
- Ako student ne razume, prebaci na njegov maternji jezik, objasni, vrati se na srpski.
- NIKAD ne objašnjavaj gramatiku. Uči kroz ponavljanje i primer.
- Ispravljaj izgovor konkretno: "Rekao si 'sesir'. Slušaj: ŠE-šir. Probaj."
- Vežbaj situacije kroz rolplej: ti si šef ili mušterija, student odgovara.
- Kad student pouzdano koristi bar 80% reči i bar 3 situacije,
  pozovi funkciju mark_lesson_complete.
"""


class TutorAgent(Agent):
    def __init__(self, *, uid: str, lesson: dict, profile: dict):
        self._uid = uid
        self._lesson_id = lesson["id"]
        super().__init__(
            instructions=SYSTEM_PROMPT.format(
                name=profile.get("firstName", "student"),
                native=profile.get("nativeLang", "en"),
                track=profile.get("track", "opšte"),
                lesson_title=lesson.get("title", ""),
                words=", ".join(w["sr"] for w in lesson.get("words", [])[:50]),
                situations=" | ".join(s["sr"] for s in lesson.get("situations", [])[:30]),
            ),
        )

    @agents.llm.function_tool
    async def mark_lesson_complete(self) -> str:
        """Pozovi kada je student savladao lekciju (≥80% reči, ≥3 situacije)."""
        async with aiohttp.ClientSession() as http:
            await http.post(
                f"{FUNCTIONS_BASE}/markLessonComplete",
                headers={"x-agent-secret": AGENT_SECRET},
                json={"uid": self._uid, "lessonId": self._lesson_id},
            )
        return "Lekcija označena kao završena. Čestitaj studentu i pozdravi se."


class ActiveTimeMeter:
    """Broji SAMO aktivne sekunde (neko govori). Idle > IDLE_CUT_SECONDS → prekid sesije."""

    def __init__(self, uid: str, session_id: str, lesson_id: str, on_idle_cut):
        self.uid, self.session_id, self.lesson_id = uid, session_id, lesson_id
        self.active_seconds = 0.0
        self._speaking_since: float | None = None
        self._last_activity = time.monotonic()
        self._on_idle_cut = on_idle_cut
        self._reported = 0

    def speech_started(self):
        self._speaking_since = time.monotonic()
        self._last_activity = self._speaking_since

    def speech_ended(self):
        if self._speaking_since is not None:
            self.active_seconds += time.monotonic() - self._speaking_since
            self._speaking_since = None
        self._last_activity = time.monotonic()

    async def run(self):
        while True:
            await asyncio.sleep(5)
            idle = time.monotonic() - self._last_activity
            if self._speaking_since is None and idle > IDLE_CUT_SECONDS:
                await self.report(done=True)
                await self._on_idle_cut()
                return
            if self.active_seconds - self._reported >= METER_INTERVAL:
                await self.report(done=False)

    async def report(self, done: bool):
        self._reported = self.active_seconds
        async with aiohttp.ClientSession() as http:
            await http.post(
                f"{FUNCTIONS_BASE}/tutorMeter",
                headers={"x-agent-secret": AGENT_SECRET},
                json={
                    "uid": self.uid, "sessionId": self.session_id,
                    "lessonId": self.lesson_id,
                    "activeSeconds": round(self.active_seconds), "done": done,
                },
            )


async def entrypoint(ctx: JobContext):
    await ctx.connect()
    participant = await ctx.wait_for_participant()

    meta = json.loads(participant.metadata or "{}")
    uid = participant.identity
    lesson_id = meta.get("lessonId", "")
    lesson = meta.get("lesson", {"id": lesson_id, "words": [], "situations": []})
    profile = meta.get("profile", {})

    session = AgentSession(
        stt=soniox.STT(
            model="stt-rt-v5",
            language_hints=["sr", profile.get("nativeLang", "en")],
            # context injection: STT pouzdanije prepoznaje reči iz lekcije
            context=", ".join(w["sr"] for w in lesson.get("words", [])[:50]),
        ),
        llm=anthropic.LLM(model="claude-haiku-4-5"),
        tts=soniox.TTS(language="sr", voice=os.environ.get("SONIOX_VOICE_SR", "default")),
        turn_detection=MultilingualModel(),
    )

    meter = ActiveTimeMeter(
        uid=uid, session_id=ctx.room.name, lesson_id=lesson["id"],
        on_idle_cut=lambda: ctx.room.disconnect(),
    )
    session.on("user_started_speaking", lambda _: meter.speech_started())
    session.on("user_stopped_speaking", lambda _: meter.speech_ended())
    session.on("agent_started_speaking", lambda _: meter.speech_started())
    session.on("agent_stopped_speaking", lambda _: meter.speech_ended())

    asyncio.create_task(meter.run())

    await session.start(
        agent=TutorAgent(uid=uid, lesson=lesson, profile=profile),
        room=ctx.room,
    )
    await session.generate_reply(
        instructions="Pozdravi studenta na srpskom, kratko. Pitaj da li je spreman da vežba."
    )

    # Uredno završi metering i na normalan kraj sesije
    async def on_close(_):
        meter.speech_ended()
        await meter.report(done=True)
    ctx.room.on("disconnected", lambda _: asyncio.create_task(on_close(None)))


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
