import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Check, CheckCircle2, ChevronRight, Clock3, FileCheck2, Info, Landmark, LoaderCircle, LockKeyhole, Play, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { currency, DOCUMENTATION_FEE, formatDocument, INSTALLMENT_OPTIONS, installmentAmount, PROCESSING_DURATION_MS, questions, SUGGESTED_CREDIT, VALIDATION_DURATION_MS } from '@/lib/credit-simulation';

export const Route = createFileRoute('/')({
  component: CreditJourney,
});

function VideoCover({ instruction = false, src = "/vsl-1.mp4" }: { instruction?: boolean, src?: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false; 
      videoRef.current.currentTime = 0; 
      videoRef.current.play().catch(err => console.error("Erro ao dar play:", err));
      setPlaying(true);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto my-6 rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video group">
      <video 
        ref={videoRef}
        src={src} 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="w-full h-full object-cover" 
      />
      {!playing && (
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center cursor-pointer" onClick={handlePlay}>
          <div className="flex items-center gap-2 text-[10px] font-bold mb-4 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            <Play size={12} fill="white" /> {instruction ? 'ANTES DE CONTINUAR' : 'CRÉDITO COOPERATIVO'}
          </div>
          <Button variant="outline" className="bg-white text-black hover:bg-gray-200 rounded-full w-16 h-16 shadow-xl transition-transform group-hover:scale-110">
            <Play fill="currentColor" />
          </Button>
          <div className="mt-4">
            <strong className="block text-lg leading-tight">{instruction ? 'Seu próximo passo começa aqui' : 'Um novo começo para seus planos'}</strong>
            <small className="opacity-80 text-xs">Assista ao vídeo · 24 segundos</small>
          </div>
        </div>
      )}
    </div>
  );
}

function CreditJourney() {
  const [step, setStep] = useState(1);
  const [document, setDocument] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [months, setMonths] = useState(24);
  const [bank, setBank] = useState('');
  const [agency, setAgency] = useState('');
  const [account, setAccount] = useState('');
  const [suggestedCredit, setSuggestedCredit] = useState(SUGGESTED_CREDIT);
  const [complete, setComplete] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  
  const question = questions[questionIndex];

  const go = (next: number) => {
    setError(''); setStep(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    if (step !== 4) return;
    setProgress(0);
    const started = Date.now();
    const timer = setInterval(() => {
      const value = Math.min(100, Math.floor((Date.now() - started) / PROCESSING_DURATION_MS * 100));
      setProgress(value);
      if (value === 100) clearInterval(timer);
    }, 40);

    const finish = setTimeout(() => { 
      const randomValue = Math.floor(Math.random() * (25000 - 5000 + 1)) + 5000;
      setSuggestedCredit(randomValue);
      setStep(5); 
      window.scrollTo({ top: 0 }); 
    }, PROCESSING_DURATION_MS + 450);

    return () => { 
      clearInterval(timer); 
      clearTimeout(finish); 
    };
  }, [step]);

  function validate() {
    if (document.replace(/\D/g, '').length !== 11) { setError('Digite os 11 números do documento de exemplo.'); return; }
    setError(''); setValidating(true);
    setTimeout(() => { setValidating(false); setQuestionIndex(0); setAnswers([]); go(3); }, VALIDATION_DURATION_MS);
  }

  function answer(value: string) {
    if (transitioning) return;
    setAnswers(prev => [...prev.slice(0, questionIndex), value]); 
    setTransitioning(true);
    setTimeout(() => {
      setTransitioning(false);
      if (questionIndex < questions.length - 1) setQuestionIndex(prev => prev + 1); else go(4);
    }, 220);
  }

  function back() {
    if (step === 3 && questionIndex > 0) { setQuestionIndex(prev => prev - 1); return; }
    if (step === 5) { setQuestionIndex(4); go(3); return; }
    go(step - 1);
  }

  function reset() { 
    setDocument(''); setAnswers([]); setQuestionIndex(0); setBank(''); setAgency(''); setAccount(''); setComplete(false); setMonths(24); setSuggestedCredit(SUGGESTED_CREDIT); go(1); 
  }

  return (
    <div className="min-h-screen bg-[#0a2533] text-white font-sans selection:bg-[#d4ff00] selection:text-black">
      {/* Header */}
      <header className="w-full py-4 px-6 flex items-center justify-between bg-[#0a2533] border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Logotipo_do_Sicoob.svg/500px-Logotipo_do_Sicoob.svg.png" alt="Sicoob" className="h-8" />
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Crédito Cooperativo</p>
          <p className="text-[10px] opacity-50">Faça sua simulação · Pague com folga</p>
        </div>
      </header>

      {step === 1 ? (
        <section className="flex flex-col items-center justify-center px-6 py-12 text-center max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-[#d4ff00] text-[11px] font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 bg-[#d4ff00] rounded-full animate-pulse" /> Seus planos merecem um novo começo
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Crédito para você.<br />
            <span className="text-[#d4ff00]">Possibilidades para<br />o seu futuro.</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-md">
            Uma nova forma de olhar para seus planos. Simule seu crédito, no seu tempo e sem complicação.
          </p>
          <VideoCover />
          <Button 
            onClick={() => go(2)} 
            className="bg-[#d4ff00] text-black hover:bg-[#b8dd00] font-bold py-6 px-8 rounded-full text-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            Simular meu crédito <ArrowRight size={20} />
          </Button>
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={14} /> Simulação gratuita, sem compromisso
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 w-full border-t border-white/10 pt-8">
            {[
              { icon: <Clock3 />, title: "Rápido e simples", desc: "Do início ao próximo passo" },
              { icon: <ShieldCheck />, title: "Você no controle", desc: "Sem compromisso" },
              { icon: <Landmark />, title: "Feito para você", desc: "Escolha suas parcelas" },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center p-4 text-center">
                <div className="text-[#d4ff00] mb-2">{b.icon}</div>
                <strong className="text-sm">{b.title}</strong>
                <small className="text-xs text-gray-400">{b.desc}</small>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <main className="max-w-md mx-auto px-6 py-8 min-h-[calc(100vh-160px)]">
          <div className="flex items-center justify-between mb-8">
            {step !== 4 && (
              <Button variant="ghost" className="text-white hover:bg-white/10 p-0 h-auto flex items-center gap-1" onClick={back}>
                <ArrowLeft size={16} /> Voltar
              </Button>
            )}
            <span className="text-xs font-medium opacity-60">
              {step === 3 ? `Pergunta ${questionIndex + 1} de ${questions.length}` : `Etapa ${step - 1} de 6`}
            </span>
          </div>

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-12 h-12 bg-[#d4ff00]/20 text-[#d4ff00] rounded-full flex items-center justify-center mb-6">
                <FileCheck2 size={24} />
              </div>
              <div className="text-[#d4ff00] text-xs font-bold uppercase tracking-wider mb-2">Vamos começar</div>
              <h1 className="text-3xl font-bold leading-tight mb-4">O primeiro passo<br />é conhecer você.</h1>
              <p className="text-gray-300 mb-8">Informe seu CPF para iniciar sua simulação de crédito.</p>
              
              <form onSubmit={e => { e.preventDefault(); validate(); }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">CPF:</label>
                  <Input 
                    className="bg-white/5 border-white/10 text-white h-14 text-lg focus:ring-[#d4ff00] focus:border-[#d4ff00]" 
                    placeholder="000.000.000-00" 
                    value={document} 
                    onChange={e => setDocument(formatDocument(e.target.value))} 
                    disabled={validating}
                  />
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <p className="text-[11px] text-gray-500">Use seus dados reais, para não ter erro na simulação.</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={validating}
                  className="w-full bg-[#d4ff00] text-black hover:bg-[#b8dd00] font-bold py-6 rounded-xl text-lg transition-all flex items-center justify-center gap-2"
                >
                  {validating ? <><LoaderCircle className="animate-spin" /> Validando...</> : <>Continuar simulação <ArrowRight size={20} /></>}
                </Button>
              </form>
              <div className="mt-8 p-4 bg-white/5 rounded-xl flex items-start gap-3 text-xs text-gray-400 border border-white/5">
                <LockKeyhole size={16} className="text-[#d4ff00] shrink-0" />
                <span>Este é um banco independente para os empréstimos. Seus dados não são armazenados.</span>
              </div>
            </div>
          )}

          {step === 3 && question && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-[#d4ff00] transition-all duration-500" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
              </div>
              <div className="text-[#d4ff00] text-xs font-bold uppercase tracking-wider mb-2">Pergunta {questionIndex + 1} de 5</div>
              <h1 className="text-3xl font-bold leading-tight mb-2">{question.title}</h1>
              <p className="text-gray-300 mb-8">{question.hint}</p>
              
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <Button 
                    key={option} 
                    onClick={() => answer(option)}
                    disabled={transitioning}
                    className={`w-full justify-between py-6 px-6 rounded-xl border transition-all text-left h-auto ${answers[questionIndex] === option ? 'bg-[#d4ff00] text-black border-[#d4ff00]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${answers[questionIndex] === option ? 'bg-black text-white' : 'bg-white/20 text-white'}`}>
                        {index + 1}
                      </span>
                      <span className="font-medium">{option}</span>
                    </div>
                    {answers[questionIndex] === option ? <Check size={20} /> : <ChevronRight size={20} className="opacity-40" />}
                  </Button>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
                <LockKeyhole size={14} /> Somente para esta simulação
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-500">
              <div className="relative w-24 h-24 mb-8">
                <LoaderCircle size={96} className="text-[#d4ff00] animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-[#d4ff00]">
                  {progress}%
                </div>
              </div>
              <div className="text-[#d4ff00] text-xs font-bold uppercase tracking-wider mb-2">Conectando possibilidades</div>
              <h1 className="text-3xl font-bold mb-4">
                {progress < 35 ? 'Analisando seu perfil...' : progress < 75 ? 'Calculando sua margem...' : 'Preparando sua simulação...'}
              </h1>
              <p className="text-gray-300 mb-8">Estamos preparando uma oferta para o seu próximo passo.</p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-[#d4ff00] transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[11px] text-gray-500">Não é uma análise real de crédito.</p>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <div className="inline-flex items-center gap-2 text-[#d4ff00] text-[11px] font-bold uppercase tracking-widest mb-4 bg-[#d4ff00]/10 px-3 py-1 rounded-full">
                <Sparkles size={12} /> Suas Possibilidades
              </div>
              <h1 className="text-3xl font-bold mb-6">Um passo mais perto dos seus planos.</h1>
              <div className="mb-8">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Valor sugerido nesta simulação</p>
                <div className="text-5xl font-black text-[#d4ff00]">{currency(suggestedCredit)}</div>
              </div>
              
              <div className="grid grid-cols-2 text-[10px] font-bold uppercase text-gray-500 mb-3 px-2">
                <span>Escolha o parcelamento</span>
                <span className="text-right">Valor por mês</span>
              </div>
              <div className="space-y-2 mb-8">
                {INSTALLMENT_OPTIONS.map(val => (
                  <button 
                    key={val} 
                    onClick={() => setMonths(val)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${months === val ? 'bg-[#d4ff00] text-black border-[#d4ff00] font-bold' : 'bg-white/5 border-white/10 text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${months === val ? 'border-black bg-black' : 'border-white/30'}`} />
                      {val} parcelas
                    </div>
                    <span className="text-lg">{currency(installmentAmount(val))}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mb-6">Pague com folga. Sicoob, a menor taxa de juros do mercado.</p>
              <Button 
                onClick={() => go(6)} 
                className="w-full bg-[#d4ff00] text-black hover:bg-[#b8dd00] font-bold py-6 rounded-xl text-lg flex items-center justify-center gap-2"
              >
                Continuar com {months} parcelas <ArrowRight size={20} />
              </Button>
            </div>
          )}

          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-[#d4ff00] text-xs font-bold uppercase tracking-wider mb-2">Seu próximo passo</div>
              <h1 className="text-3xl font-bold mb-2">Onde seus planos ganham vida.</h1>
              <p className="text-gray-300 mb-6">Escolha uma instituição para o saque.</p>
              
              <VideoCover instruction src="/meu-video.mp4" />
              
              <form onSubmit={e => { e.preventDefault(); if (!bank || !agency || !account) { setError('Preencha todos os campos.'); return; } go(7); }} className="space-y-6">
                <div className="grid grid-cols-3 gap-2">
                  {['Sicoob', 'Nubank', 'Itaú', 'Caixa', 'Inter', 'Bradesco', 'Santander', 'Banco do Brasil', 'Picpay', 'Mercado Pago', 'Outro'].map(name => (
                    <button 
                      key={name} 
                      type="button" 
                      onClick={() => setBank(name)}
                      className={`p-2 rounded-lg border text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-2 aspect-square ${bank === name ? 'bg-[#d4ff00] text-black border-[#d4ff00]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                    >
                      <Landmark size={16} /> {name}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Agência</label>
                    <Input className="bg-white/5 border-white/10 text-white h-12" placeholder="0000" value={agency} onChange={e => setAgency(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400">Conta</label>
                    <Input className="bg-white/5 border-white/10 text-white h-12" placeholder="00000-0" value={account} onChange={e => setAccount(e.target.value)} />
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <Button className="w-full bg-[#d4ff00] text-black hover:bg-[#b8dd00] font-bold py-6 rounded-xl text-lg flex items-center justify-center gap-2">
                  Revisar minha simulação <ArrowRight size={20} />
                </Button>
              </form>
            </div>
          )}

          {step === 7 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <div className="w-16 h-16 bg-[#d4ff00]/20 text-[#d4ff00] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <div className="text-[#d4ff00] text-xs font-bold uppercase tracking-wider mb-2">Tudo pronto para revisar</div>
              <h1 className="text-3xl font-bold mb-4">Sua simulação está pronta.</h1>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 mb-8 text-left">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Empréstimo</span><strong className="text-white">{currency(suggestedCredit)}</strong></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Parcelamento</span><strong className="text-white">{months}x {currency(installmentAmount(months))}</strong></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Banco</span><strong className="text-white">{bank}</strong></div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Taxa de Documentação</span>
                  <strong className="text-[#d4ff00]">{currency(DOCUMENTATION_FEE)}</strong>
                </div>
              </div>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3 text-xs text-blue-200 mb-8 text-left">
                <Info size={16} className="shrink-0" />
                <span>A taxa de confirmação de usuário reconhece seus documentos e previne robôs. Valor totalmente reembolsado.</span>
              </div>
              
              <Button 
                onClick={() => window.location.href = 'https://ambieenteseguro.site/f/ed5twbff8d'} 
                className="w-full bg-[#d4ff00] text-black hover:bg-[#b8dd00] font-bold py-6 rounded-xl text-lg flex items-center justify-center gap-2"
              >
                Prosseguir ao saque <BadgeCheck size={20} />
              </Button>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} /> Pagamento seguro.
              </div>
            </div>
          )}
        </main>
      )}

      <footer className="w-full py-8 px-6 text-center border-t border-white/10 mt-12">
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
          <LockKeyhole size={12} /> Seus planos em primeiro lugar.
        </div>
        <p className="text-[10px] text-gray-600 leading-relaxed">
          Empréstimo para negativados.<br />
          O CNPJ matriz do Banco Cooperativo Sicoob S.A. é 02.367.871/0001-73.
        </p>
      </footer>
    </div>
  );
}
