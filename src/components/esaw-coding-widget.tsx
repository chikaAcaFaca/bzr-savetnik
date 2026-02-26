'use client';

/**
 * ESAW Coding Widget
 *
 * AI-powered injury classification component.
 * TextArea for injury description -> "Kodiraj sa AI" button -> shows ESAW codes.
 * Each code has a dropdown to manually override.
 */

import { useState } from 'react';
import { Bot, ChevronDown, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';

interface EsawCode {
  tabelaBroj: number;
  tabelaNaziv: string;
  kod: string;
  naziv: string;
  confidence: number;
}

interface EsawCodingResult {
  codes: EsawCode[];
  reasoning: string;
}

interface EsawOption {
  kod: string;
  naziv: string;
}

interface EsawCodingWidgetProps {
  onCode?: (description: string) => Promise<EsawCodingResult>;
  onGetOptions?: (tabelaBroj: number) => Promise<EsawOption[]>;
  onCodesChange?: (codes: EsawCode[]) => void;
  initialCodes?: EsawCode[];
}

const tabelaDescriptions: Record<number, string> = {
  5: 'Gde se desila povreda',
  6: 'Sta je radnik radio (proces)',
  7: 'Konkretna fizicka aktivnost u momentu povrede',
  8: 'Sta je poslo drugacije od normalnog',
  9: 'Kako je doslo do kontakta koji je izazvao povredu',
  10: 'Predmet/materijal koji je izazvao odstupanje',
  11: 'Predmet/materijal koji je izazvao povredu',
  12: 'Koji deo tela je povredjen',
  13: 'Vrsta/tip povrede',
};

export default function EsawCodingWidget({
  onCode,
  onGetOptions,
  onCodesChange,
  initialCodes = [],
}: EsawCodingWidgetProps) {
  const [description, setDescription] = useState('');
  const [codes, setCodes] = useState<EsawCode[]>(initialCodes);
  const [reasoning, setReasoning] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<EsawOption[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const handleCode = async () => {
    if (!onCode || !description.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await onCode(description);
      setCodes(result.codes);
      setReasoning(result.reasoning);
      onCodesChange?.(result.codes);
    } catch (err) {
      setError('Greska pri kodiranju. Pokusajte ponovo.');
      console.error('ESAW coding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDropdown = async (tabelaBroj: number) => {
    if (dropdownOpen === tabelaBroj) {
      setDropdownOpen(null);
      return;
    }

    setDropdownOpen(tabelaBroj);

    if (onGetOptions) {
      setDropdownLoading(true);
      try {
        const options = await onGetOptions(tabelaBroj);
        setDropdownOptions(options);
      } catch {
        setDropdownOptions([]);
      } finally {
        setDropdownLoading(false);
      }
    }
  };

  const handleSelectCode = (tabelaBroj: number, option: EsawOption) => {
    const updatedCodes = codes.map(c =>
      c.tabelaBroj === tabelaBroj
        ? { ...c, kod: option.kod, naziv: option.naziv, confidence: 1.0 }
        : c
    );
    setCodes(updatedCodes);
    onCodesChange?.(updatedCodes);
    setDropdownOpen(null);
  };

  const confidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const confidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-3 w-3 text-green-500" />;
    if (confidence >= 0.5) return <AlertCircle className="h-3 w-3 text-yellow-500" />;
    return <AlertCircle className="h-3 w-3 text-red-500" />;
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI kodiranje povrede (ESAW)</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Input area */}
        <div>
          <label className="text-sm font-medium mb-1 block">Opis povrede na srpskom jeziku</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Npr: Radnik se okliznuo na mokre plocice u magacinu i pao na pod, pri cemu je zadobio prelom rucnog zgloba desne ruke."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px] resize-y"
          />
        </div>

        <button
          onClick={handleCode}
          disabled={loading || !description.trim()}
          className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Kodiranje u toku...
            </>
          ) : (
            <>
              <Bot className="h-4 w-4" />
              Kodiraj sa AI
            </>
          )}
        </button>

        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Results */}
        {codes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Predlozeni ESAW kodovi:</p>

            {codes.map((code) => (
              <div key={code.tabelaBroj} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Tabela {code.tabelaBroj}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {code.tabelaNaziv}
                      </span>
                      <div className="group relative inline-block">
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-foreground text-background text-xs p-2 rounded shadow-lg w-48 z-10">
                          {tabelaDescriptions[code.tabelaBroj] || code.tabelaNaziv}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{code.kod}</span>
                      <span className="text-sm">{code.naziv}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {confidenceIcon(code.confidence)}
                    <span className={`text-xs ${confidenceColor(code.confidence)}`}>
                      {Math.round(code.confidence * 100)}%
                    </span>

                    {/* Override dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => handleOpenDropdown(code.tabelaBroj)}
                        className="text-xs text-muted-foreground hover:text-foreground border rounded px-2 py-1 flex items-center gap-1"
                      >
                        Promeni
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {dropdownOpen === code.tabelaBroj && (
                        <div className="absolute right-0 top-full mt-1 w-80 max-h-60 overflow-y-auto bg-background border rounded-md shadow-lg z-20">
                          {dropdownLoading ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                              Ucitavanje opcija...
                            </div>
                          ) : (
                            dropdownOptions.map((option) => (
                              <button
                                key={option.kod}
                                onClick={() => handleSelectCode(code.tabelaBroj, option)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted border-b last:border-b-0"
                              >
                                <span className="font-mono mr-2">{option.kod}</span>
                                {option.naziv}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* AI reasoning */}
            {reasoning && (
              <div className="p-3 rounded-md bg-muted text-sm">
                <p className="font-medium text-xs text-muted-foreground mb-1">AI obrazlozenje:</p>
                <p>{reasoning}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
