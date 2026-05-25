import React, { useEffect, useState } from 'react';

async function fetchFact(): Promise<string> {
  try {
    const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
    const data = await res.json();
    const english = (data.text as string).replace(/`/g, "'");
    const transRes = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(english)}&langpair=en|he`
    );
    const transData = await transRes.json();
    const translated: string = transData.responseData?.translatedText;
    return translated && !translated.includes('MYMEMORY WARNING') ? translated : english;
  } catch {
    return 'טנריף — "האי האביב הנצחי" 🌋';
  }
}

export function FunFact() {
  const [fact, setFact] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const text = await fetchFact();
    setFact(text);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl bg-white border border-ocean-100 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-extrabold text-ocean-700">💡 ידעת?</span>
        {!loading && (
          <button onClick={load} className="text-[10px] text-zinc-400 hover:text-ocean-600">↻ עוד</button>
        )}
      </div>
      {loading
        ? <div className="text-[12px] text-zinc-400 animate-pulse">טוען עובדה...</div>
        : <p className="text-[12px] text-zinc-600 leading-5">{fact}</p>
      }
    </div>
  );
}
