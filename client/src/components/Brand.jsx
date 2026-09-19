export default function Brand({ size = 'md' }) {
  return (
    <div className={`brand brand-${size}`}>
      <img src="/logo-mark.png" alt="" className="brand-mark" />
      <span className="brand-name">Voltra Global</span>
    </div>
  );
}
