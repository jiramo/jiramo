import './index.css'

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        Jiramo
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#666' }}>
        The #1 CRM built for developers
      </p>
    </div>
  )
}

export default App
