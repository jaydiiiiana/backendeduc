export default function Home() {
  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#fafaf9',
      color: '#1e40af'
    }}>
      <h1 style={{ fontSize: '3rem', margin: '0' }}>Cat Academy API 🏛️🐾</h1>
      <p style={{ fontSize: '1.2rem', color: '#64748b' }}>The scholarly backend is officially running.</p>
      <div style={{ 
        marginTop: '20px', 
        padding: '10px 20px', 
        backgroundColor: '#dbeafe', 
        borderRadius: '8px',
        fontWeight: 'bold'
      }}>
        Status: Operational ⚡
      </div>
    </div>
  );
}
