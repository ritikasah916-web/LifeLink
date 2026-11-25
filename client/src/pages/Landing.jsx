import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const steps = [
  { number: "01", title: "Create your account", text: "Join as a donor or a hospital in just a few minutes." },
  { number: "02", title: "Find the right match", text: "Blood requests are matched by blood group and city." },
  { number: "03", title: "Respond and connect", text: "Donors can respond to requests so hospitals can follow up." }
];

export default function Landing() {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> A community that cares</div>
            <h1>One connection.<br /><em>One more life.</em></h1>
            <p className="hero-description">When every second matters, finding the right blood donor should be simpler. LifeLink brings donors and hospitals closer, when it matters most.</p>
            <div className="hero-actions"><Link to="/register" className="button button-primary button-large">Become a donor <span>→</span></Link><Link to="/login" className="button button-outline button-large">Hospital / Admin login</Link></div>
            <div className="hero-note"><span className="note-heart">♥</span> Your small act can make a life-changing difference.</div>
          </div>
          <div className="hero-art" aria-label="Illustration of a heart and blood drop">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="art-circle"><div className="art-heart">♥</div><div className="art-drop" /></div>
            <div className="floating-card card-top"><span className="float-icon">✚</span><span><b>Every donor counts</b><small>Be someone's hope</small></span></div>
            <div className="floating-card card-bottom"><span className="online-dot" /><span><b>Community powered</b><small>Connected by compassion</small></span></div>
            <span className="spark spark-one">✦</span><span className="spark spark-two">✧</span>
          </div>
        </section>
        <section className="trust-strip" id="impact"><div><strong>8</strong><span>Blood groups</span></div><div><strong>1</strong><span>Shared mission</span></div><div><strong>24/7</strong><span>Digital access</span></div><div className="trust-message">A better way to connect people who can help.</div></section>
        <section className="how-section" id="how-it-works">
          <div className="section-kicker">SIMPLE. HUMAN. CONNECTED.</div><h2>Help can start with <em>one step.</em></h2><p className="section-intro">LifeLink makes the journey from a blood request to a donor response clear and accessible.</p>
          <div className="steps-grid">{steps.map(step => <article className="step-card" key={step.number}><span className="step-number">{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
        </section>
        <section className="cta-band"><div><div className="section-kicker light">BE THE REASON SOMEONE SMILES</div><h2>Ready to make a difference?</h2><p>Join the LifeLink community today.</p></div><Link to="/register" className="button button-light button-large">Get started <span>→</span></Link></section>
      </main>
      <footer className="site-footer"><Link to="/" className="brand-lockup"><span className="brand-mark">♥</span><span>LifeLink</span></Link><span>Made with care. Every drop matters.</span><span>© {new Date().getFullYear()} LifeLink</span></footer>
    </div>
  );
}