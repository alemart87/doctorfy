import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props){
    super(props);
    this.state = { hasError:false };
  }

  static getDerivedStateFromError(){
    return { hasError:true };
  }

  componentDidCatch(err,info){
    // Puedes loguear a un servicio externo aquí
    console.error('ErrorBoundary atrapó un error:', err, info);
  }

  render(){
    if(this.state.hasError){
      return (
        <div className="error-container">
          <h2>Algo salió mal</h2>
          <p>Por favor recarga la página o contacta soporte.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 