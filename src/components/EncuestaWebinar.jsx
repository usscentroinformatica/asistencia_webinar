import React, { useState, useEffect } from 'react';
import logoUss from '../assets/uss.png';

// Iconos SVG (solo los que se usan)
const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a2290" strokeWidth="2.5">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6 2h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#63ed12" strokeWidth="2.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5a2290" strokeWidth="2.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const SuccessIcon = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="45" fill="#63ed12"/>
    <path d="M30 50 L43 63 L70 37" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EncuestaWebinar = () => {
  // ID de tu Google Sheets
  const SHEET_ID = '1kctyvMFqAkvKIxIiQul3it6cOivNDORK8uEzza2nct4';
  
  // Estados principales
  const [tipoUsuario, setTipoUsuario] = useState(''); // 'uss' o 'externo'
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correoExterno, setCorreoExterno] = useState('');
  const [estudiantesEncontrados, setEstudiantesEncontrados] = useState([]);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    curso: '',
    pead: '',
    docente: '',
    turno: '',
    dias: '',
    horaInicio: '',
    horaFin: '',
    solicitaCertificado: 'no',
    comentarios: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exitoModal, setExitoModal] = useState(false);
  const [baseEstudiantes, setBaseEstudiantes] = useState([]);
  const [paso, setPaso] = useState('seleccion');

  // Cargar base de datos al iniciar
  useEffect(() => {
    const cargarBaseEstudiantes = async () => {
      try {
        const response = await fetch(`https://opensheet.elk.sh/${SHEET_ID}/BaseUnificada`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Base cargada:', data.length, 'estudiantes');
          setBaseEstudiantes(data);
        } else {
          console.warn('No se pudo cargar la base, usando datos de ejemplo');
          // Datos de ejemplo con múltiples cursos
          setBaseEstudiantes([
            {
              "Correo institucional": "arandade@uss.edu.pe",
              "Nombre completo": "CEPEDA ARANDA, DANIELA ELIZABETH",
              "Curso": "COMPUTACIÓN II",
              "Sección (PEAD)": "PEAD-a",
              "Docente": "QUESADA QUIROZ JENNIE",
              "Turno": "MAÑANA",
              "Días": "Lunes y Miércoles",
              "Hora inicio": "8:00",
              "Hora fin": "11:00"
            },
            {
              "Correo institucional": "arandade@uss.edu.pe",
              "Nombre completo": "CEPEDA ARANDA, DANIELA ELIZABETH",
              "Curso": "MATEMÁTICA I",
              "Sección (PEAD)": "PEAD-b",
              "Docente": "PÉREZ GÓMEZ CARLOS",
              "Turno": "TARDE",
              "Días": "Martes y Jueves",
              "Hora inicio": "14:00",
              "Hora fin": "17:00"
            },
            {
              "Correo institucional": "cleivajeanpier@uss.edu.pe",
              "Nombre completo": "CHAVEZ LEIVA, JEAN PIER",
              "Curso": "COMPUTACIÓN II",
              "Sección (PEAD)": "PEAD-a",
              "Docente": "QUESADA QUIROZ JENNIE",
              "Turno": "MAÑANA",
              "Días": "Lunes y Miércoles",
              "Hora inicio": "8:00",
              "Hora fin": "11:00"
            },
            {
              "Correo institucional": "cmartinezfatim@uss.edu.pe",
              "Nombre completo": "CHAVEZ MARTINEZ, FATIMA DEL CARMEN",
              "Curso": "COMPUTACIÓN II",
              "Sección (PEAD)": "PEAD-a",
              "Docente": "QUESADA QUIROZ JENNIE",
              "Turno": "MAÑANA",
              "Días": "Lunes y Miércoles",
              "Hora inicio": "8:00",
              "Hora fin": "11:00"
            }
          ]);
        }
      } catch (error) {
        console.error('Error cargando base:', error);
      }
    };

    cargarBaseEstudiantes();
  }, []);

  // Manejar selección de tipo de usuario
  const handleSeleccionTipo = (tipo) => {
    setTipoUsuario(tipo);
    setError('');
    
    if (tipo === 'uss') {
      setPaso('login');
    } else {
      // Usuario externo - limpiar formulario
      setCorreoExterno('');
      setEstudiantesEncontrados([]);
      setFormData({
        nombreCompleto: '',
        curso: '',
        pead: '',
        docente: '',
        turno: '',
        dias: '',
        horaInicio: '',
        horaFin: '',
        solicitaCertificado: 'no',
        comentarios: ''
      });
      setPaso('formulario');
    }
  };

  // Verificar correo USS
  const verificarCorreoUSS = () => {
    if (!nombreUsuario.trim()) {
      setError('Por favor, ingresa tu nombre de usuario');
      return;
    }

    setLoading(true);
    setError('');

    const emailCompleto = `${nombreUsuario.trim()}@uss.edu.pe`.toLowerCase();
    
    // Buscar TODOS los cursos del estudiante en la base de datos
    const encontrados = baseEstudiantes.filter(
      estudiante => estudiante["Correo institucional"] && 
                    estudiante["Correo institucional"].toLowerCase() === emailCompleto
    );

    if (encontrados.length > 0) {
      console.log('✅ Estudiante USS encontrado con', encontrados.length, 'cursos:', encontrados);
      setEstudiantesEncontrados(encontrados);
      
      // Un solo curso: autocompletar ese curso. Varios cursos: mismo nombre, se registrará en todos
      const primerCurso = encontrados[0];
      setFormData({
        nombreCompleto: primerCurso["Nombre completo"] || '',
        curso: encontrados.length === 1 ? (primerCurso["Curso"] || '') : '',
        pead: encontrados.length === 1 ? (primerCurso["Sección (PEAD)"] || '') : '',
        docente: encontrados.length === 1 ? (primerCurso["Docente"] || '') : '',
        turno: encontrados.length === 1 ? (primerCurso["Turno"] || '') : '',
        dias: encontrados.length === 1 ? (primerCurso["Días"] || '') : '',
        horaInicio: encontrados.length === 1 ? (primerCurso["Hora inicio"] || '') : '',
        horaFin: encontrados.length === 1 ? (primerCurso["Hora fin"] || '') : '',
        solicitaCertificado: 'no',
        comentarios: ''
      });
      
      // Pasar al formulario
      setPaso('formulario');
    } else {
      console.log('⚠️ Correo no encontrado:', emailCompleto);
      setError('❌ Correo no encontrado. Verifica tu nombre de usuario.');
    }
    
    setLoading(false);
  };

  // Actualizar datos cuando se selecciona un curso
  const actualizarDatosCurso = (curso) => {
    if (curso) {
      setFormData({
        nombreCompleto: curso["Nombre completo"] || '',
        curso: curso["Curso"] || '',
        pead: curso["Sección (PEAD)"] || '',
        docente: curso["Docente"] || '',
        turno: curso["Turno"] || '',
        dias: curso["Días"] || '',
        horaInicio: curso["Hora inicio"] || '',
        horaFin: curso["Hora fin"] || '',
        solicitaCertificado: formData.solicitaCertificado,
        comentarios: formData.comentarios
      });
    }
  };

  // Manejar selección de curso
  const handleSeleccionCurso = (e) => {
    const cursoNombre = e.target.value;
    const cursoSeleccionado = estudiantesEncontrados.find(c => c["Curso"] === cursoNombre);
    if (cursoSeleccionado) {
      actualizarDatosCurso(cursoSeleccionado);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'radio') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (name === 'correoExterno') {
      setCorreoExterno(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const enviarEncuesta = async () => {
  // Validar nombre completo (obligatorio para todos)
  if (!formData.nombreCompleto.trim()) {
    setError('El nombre completo es requerido');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const esEstudianteUSS = tipoUsuario === 'uss' && estudiantesEncontrados.length > 0;
    const tipoUsuarioTexto = esEstudianteUSS ? 'Estudiante USS' : 'Externo';
    
    // Correo para todos
    let correoParaEnviar = '';
    if (esEstudianteUSS) {
      correoParaEnviar = `${nombreUsuario}@uss.edu.pe`.toLowerCase();
    } else if (tipoUsuario === 'externo') {
      correoParaEnviar = correoExterno.trim();
    }

    console.log(`📊 CURSOS ENCONTRADOS: ${estudiantesEncontrados.length}`);
    
    // Verificar que todos los cursos tengan datos
    const cursosValidos = estudiantesEncontrados.filter(cur => cur["Curso"] && cur["Curso"].trim());
    console.log(`✅ Cursos válidos: ${cursosValidos.length} de ${estudiantesEncontrados.length}`);

    // Crear registros
    const registros = esEstudianteUSS
      ? cursosValidos.map((cur) => ({
          nombreCompleto: formData.nombreCompleto.trim(),
          curso: cur["Curso"] || '',
          pead: cur["Sección (PEAD)"] || '',
          comentarios: formData.comentarios || '',
          solicitaCertificado: formData.solicitaCertificado,
          tipoUsuario: tipoUsuarioTexto,
          correo: correoParaEnviar
        }))
      : [{
          nombreCompleto: formData.nombreCompleto.trim(),
          curso: '',
          pead: '',
          comentarios: formData.comentarios || '',
          solicitaCertificado: formData.solicitaCertificado,
          tipoUsuario: tipoUsuarioTexto,
          correo: correoParaEnviar
        }];

    console.log(`📤 Enviando ${registros.length} registro(s)`);

    // ESTRATEGIA MEJORADA: Enviar con pausas más inteligentes
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBds_DWYQ2QV8aI46ZVHXlB1mictt7LNPMYvR8mxNTQsFCcsFvdJa9Sf-TYRWgSf136g/exec';
    
    const exitosos = [];
    const fallidos = [];

    // Enviar registros secuencialmente con pausas variables
    for (let i = 0; i < registros.length; i++) {
      const registro = registros[i];
      const esUltimoRegistro = i === registros.length - 1;
      
      console.log(`\n📝 Enviando ${i+1}/${registros.length}: ${registro.curso || 'Externo'}`);
      
      // Pausa más larga cada 2 registros para evitar límites
      if (i > 0) {
        let pausa = 150; // Base 150ms
        
        // Si hay 4+ cursos, hacer pausas más largas
        if (registros.length >= 4) {
          pausa = 200; // 200ms para 4+ cursos
          
          // Pausa extra en el medio
          if (i === Math.floor(registros.length / 2)) {
            pausa = 300;
          }
        }
        
        console.log(`⏳ Pausa de ${pausa}ms...`);
        await new Promise(resolve => setTimeout(resolve, pausa));
      }

      try {
        // Enviar con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos
        
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registro),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        exitosos.push(registro.curso || 'Externo');
        console.log(`✅ Enviado: ${registro.curso || 'Externo'}`);
        
        // Pequeña pausa adicional si no es el último
        if (!esUltimoRegistro) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
      } catch (error) {
        console.error(`❌ Error en registro ${i+1}:`, error);
        fallidos.push({
          curso: registro.curso || 'Externo',
          error: error.message
        });
        
        // No reintentar inmediatamente para evitar congestionar
        if (registros.length >= 4 && i < registros.length - 1) {
          console.log('⚠️ Continuando con siguiente registro...');
        }
      }
    }

    console.log('\n📊 RESULTADO FINAL:');
    console.log(`Exitosos: ${exitosos.length}/${registros.length}`);
    console.log(`Fallidos: ${fallidos.length}`);
    
    if (fallidos.length > 0) {
      console.log('Cursos fallados:', fallidos.map(f => f.curso));
    }

    // Mostrar resultado
    if (exitosos.length > 0) {
      setExitoModal(true);
      
      // Mensaje según resultados
      let mensaje = '';
      if (exitosos.length === registros.length) {
        mensaje = `✅ Se registró en ${exitosos.length} curso(s)`;
      } else {
        mensaje = `⚠️ Se registró en ${exitosos.length} de ${registros.length} cursos`;
      }
      
      setTimeout(() => {
        setExitoModal(false);
        setPaso('seleccion');
        resetearTodo();
      }, 3000);
    } else {
      throw new Error('No se pudo registrar ningún curso');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
    setError(`Error al enviar: ${error.message}. Intenta de nuevo.`);
  } finally {
    setLoading(false);
  }
};

// Función para resetear todo
const resetearTodo = () => {
  setTipoUsuario('');
  setNombreUsuario('');
  setCorreoExterno('');
  setEstudiantesEncontrados([]);
  setFormData({
    nombreCompleto: '',
    curso: '',
    pead: '',
    docente: '',
    turno: '',
    dias: '',
    horaInicio: '',
    horaFin: '',
    solicitaCertificado: 'no',
    comentarios: ''
  });
};

  // Modal de éxito
  if (exitoModal) {
    return (
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(0,0,0,0.8)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 9999 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '60px 50px', 
          borderRadius: '20px', 
          textAlign: 'center', 
          maxWidth: '520px', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)' 
        }}>
          <SuccessIcon />
          <h1 style={{ 
            color: '#5a2290', 
            fontSize: '36px', 
            margin: '30px 0 16px', 
            fontWeight: '700' 
          }}>
            Encuesta Enviada
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#555', 
            marginBottom: '30px' 
          }}>
            Gracias por tu valiosa participación
          </p>
          <div style={{ 
            backgroundColor: '#e8f5e1', 
            padding: '20px', 
            borderRadius: '12px', 
            color: '#1a5e20', 
            fontWeight: '600' 
          }}>
            Tu encuesta ha sido registrada exitosamente
          </div>
          <p style={{ 
            marginTop: '30px', 
            color: '#888', 
            fontSize: '15px' 
          }}>
            Redirigiendo en 5 segundos...
          </p>
        </div>
      </div>
    );
  }

  // Pantalla de selección de tipo de usuario
  if (paso === 'seleccion') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        fontFamily: 'Roboto, Arial, sans-serif', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <header style={{ 
          backgroundColor: '#ffffff',
          borderBottom: '6px solid #63ed12',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            maxWidth: '680px', 
            margin: '0 auto',
            padding: '30px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <img 
              src={logoUss} 
              alt="Universidad Señor de Sipán" 
              style={{ 
                width: '200px',
                height: 'auto',
                objectFit: 'contain'
              }} 
            />
          </div>
        </header>

        <main style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '40px 20px' 
        }}>
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '680px'
          }}>
            <div className="card-header" style={{ 
              backgroundColor: '#5a2290',
              color: 'white', 
              textAlign: 'center',
              border: 'none'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '28px', 
                fontWeight: '400' 
              }}>
                ENCUESTA DE ASISTENCIA WEBINAR
              </h2>
              <div style={{ 
                marginTop: '12px', 
                fontSize: '16px',
                fontWeight: '500'
              }}>
                2026 ENERO
              </div>
            </div>

            <div className="card-body" style={{ padding: '40px' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{ 
                  fontSize: '22px', 
                  color: '#202124', 
                  marginBottom: '16px' 
                }}>
                  Antes de comenzar...
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  color: '#5f6368', 
                  marginBottom: '32px',
                  lineHeight: '1.6'
                }}>
                  Selecciona tu tipo de usuario para continuar con la encuesta
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '24px',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                <button
                  onClick={() => handleSeleccionTipo('uss')}
                  className="btn btn-outline-primary"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 20px',
                    border: '2px solid #5a2290',
                    borderRadius: '12px',
                    textAlign: 'center',
                    width: '100%',
                    background: 'transparent',
                    color: '#5a2290',
                    fontSize: '1rem'
                  }}
                >
                  <div style={{ 
                    fontSize: '48px', 
                    marginBottom: '16px'
                  }}>
                    🎓
                  </div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    marginBottom: '8px'
                  }}>
                    Estudiante USS
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#5f6368',
                    lineHeight: '1.5'
                  }}>
                    Ingresa con tu usuario institucional<br />
                  </div>
                </button>

                <button
                  onClick={() => handleSeleccionTipo('externo')}
                  className="btn btn-outline-success"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px 20px',
                    border: '2px solid #63ed12',
                    borderRadius: '12px',
                    textAlign: 'center',
                    width: '100%',
                    background: 'transparent',
                    color: '#63ed12',
                    fontSize: '1rem'
                  }}
                >
                  <div style={{ 
                    fontSize: '48px', 
                    marginBottom: '16px'
                  }}>
                    👨‍💼
                  </div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    marginBottom: '8px'
                  }}>
                    Usuario Externo
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#5f6368',
                    lineHeight: '1.5'
                  }}>
                    Si no eres estudiante USS<br />
                  </div>
                </button>
              </div>

              <div className="mt-4 p-3 bg-light rounded text-center" style={{ 
                fontSize: '14px',
                color: '#5f6368'
              }}>
                El formulario se creó en el Centro de Informática de la Universidad Señor de Sipán
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla de login (solo para estudiantes USS)
  if (paso === 'login') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        fontFamily: 'Roboto, Arial, sans-serif', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <header style={{ 
          backgroundColor: '#ffffff',
          borderBottom: '6px solid #63ed12',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            maxWidth: '680px', 
            margin: '0 auto',
            padding: '30px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <img 
              src={logoUss} 
              alt="Universidad Señor de Sipán" 
              style={{ 
                width: '200px',
                height: 'auto',
                objectFit: 'contain'
              }} 
            />
          </div>
        </header>

        <main style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          padding: '40px 20px' 
        }}>
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '680px'
          }}>
            <div className="card-header" style={{ 
              backgroundColor: '#5a2290',
              color: 'white', 
              textAlign: 'center',
              border: 'none'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '28px', 
                fontWeight: '400' 
              }}>
                INGRESO ESTUDIANTE USS
              </h2>
              <div style={{ 
                marginTop: '12px', 
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Ingresa tu usuario institucional
              </div>
            </div>

            <div className="card-body" style={{ padding: '32px' }}>
              <button
                onClick={() => {
                  setPaso('seleccion');
                  setTipoUsuario('');
                }}
                className="btn btn-outline-secondary mb-4"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ← Cambiar tipo de usuario
              </button>

              <div className="mb-4">
                <label className="form-label fw-bold">
                  Usuario institucional <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value.toLowerCase().trim())}
                    onKeyDown={(e) => e.key === 'Enter' && verificarCorreoUSS()}
                    placeholder="tuusuario"
                    disabled={loading}
                    autoFocus
                    className="form-control"
                    style={{ borderRight: 'none' }}
                  />
                  <span className="input-group-text" style={{ 
                    backgroundColor: 'white',
                    color: '#5f6368', 
                    fontWeight: '500' 
                  }}>
                    @uss.edu.pe
                  </span>
                </div>
                <div className="form-text">
                  Ingresa solo tu nombre de usuario sin el @uss.edu.pe<br />
                  Ejemplo: Si tu correo es <strong>estudiante@uss.edu.pe</strong>, ingresa: <strong>estudiante</strong>
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button
                  onClick={() => {
                    setPaso('seleccion');
                    setTipoUsuario('');
                    setNombreUsuario('');
                  }}
                  className="btn btn-outline-secondary"
                >
                  Cancelar
                </button>

                <button
                  onClick={verificarCorreoUSS}
                  disabled={loading || !nombreUsuario.trim()}
                  className="btn"
                  style={{
                    backgroundColor: loading || !nombreUsuario.trim() ? '#f1f3f4' : '#5a2290',
                    color: loading || !nombreUsuario.trim() ? '#9aa0a6' : 'white',
                    border: 'none'
                  }}
                >
                  {loading ? 'Verificando...' : 'Continuar'}
                </button>
              </div>

              {error && (
                <div className="alert alert-danger mt-4 d-flex align-items-center">
                  <span className="me-2">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Pantalla del formulario
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      fontFamily: 'Roboto, Arial, sans-serif' 
    }}>
      <header style={{ 
        backgroundColor: '#ffffff', 
        borderBottom: '6px solid #63ed12', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          padding: '30px 20px', 
          display: 'flex', 
          justifyContent: 'center' 
        }}>
          <img src={logoUss} alt="Universidad Señor de Sipán" style={{ height: '80px' }} />
        </div>
      </header>

      <main style={{ padding: '40px 20px' }}>
        <div className="card mx-auto" style={{ 
          maxWidth: '680px' 
        }}>
          <div className="card-header" style={{ 
            backgroundColor: '#5a2290', 
            color: 'white', 
            textAlign: 'center',
            position: 'relative',
            border: 'none'
          }}>

            <h1 className="mb-2" style={{ fontSize: '28px', fontWeight: '400' }}>
              ENCUESTA DE ASISTENCIA WEBINAR
            </h1>
            <div style={{ fontSize: '16px' }}>
              202600 ENERO
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
              {estudiantesEncontrados.length > 0 ? 'Datos autocompletados de BaseUnificada' : 'Usuario Externo - Completa tus datos'}
            </div>
          </div>

          <div className="card-body" style={{ padding: '32px' }}>
            {error && (
              <div className="alert alert-danger d-flex align-items-center mb-4">
                <span className="me-2">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="card mb-4 border-0" style={{ 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div className="card-body">
                <h5 className="card-title d-flex align-items-center mb-3" style={{ 
                  color: '#5a2290', 
                  fontWeight: '600' 
                }}>
                  Información del {estudiantesEncontrados.length > 0 ? 'estudiante USS' : 'usuario'}
                </h5>

                <div className="row g-3">
                  {/* NOMBRE COMPLETO - Obligatorio para todos */}
                  <div className="col-12">
                    <div className="d-flex align-items-center p-3 rounded" style={{ 
                      backgroundColor: '#e8f5e1' 
                    }}>
                      <UserIcon />
                      <div className="ms-3 flex-grow-1">
                        <label className="form-label fw-bold" style={{ color: '#63ed12' }}>
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          name="nombreCompleto"
                          value={formData.nombreCompleto}
                          onChange={handleChange}
                          className="form-control"
                          readOnly={estudiantesEncontrados.length > 0}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* CORREO ELECTRÓNICO - Solo para usuarios externos */}
                  {tipoUsuario === 'externo' && (
                    <div className="col-12">
                      <div className="d-flex align-items-center p-3 rounded" style={{ 
                        backgroundColor: '#f0f7ff' 
                      }}>
                        <EmailIcon />
                        <div className="ms-3 flex-grow-1">
                          <label className="form-label fw-bold" style={{ color: '#5a2290' }}>
                            Correo electrónico *
                          </label>
                          <input
                            type="email"
                            name="correoExterno"
                            value={correoExterno}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="ejemplo@email.com"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INFO: Se registrará en todos sus cursos (solo si tiene varios) */}
                  {estudiantesEncontrados.length > 1 && (
                    <div className="col-12">
                      <div className="d-flex align-items-start p-3 rounded" style={{ 
                        backgroundColor: '#e8f5e1' 
                      }}>
                        <BookIcon />
                        <div className="ms-3 flex-grow-1">
                          <div className="fw-bold" style={{ color: '#63ed12' }}>
                            Te registrarás en todos tus cursos ({estudiantesEncontrados.length})
                          </div>
                          <label className="form-label mt-2 mb-1" style={{ fontSize: '14px', color: '#1a5e20' }}>
                            Ver detalles de:
                          </label>
                          <select
                            className="form-select form-select-sm mb-2"
                            style={{ maxWidth: '320px' }}
                            value={formData.curso || ''}
                            onChange={handleSeleccionCurso}
                          >
                            {estudiantesEncontrados.map((c, i) => (
                              <option key={i} value={c["Curso"]}>{c["Curso"]} – {c["Sección (PEAD)"]} ({c["Turno"]})</option>
                            ))}
                          </select>
                          <ul className="mb-0 mt-2 ps-3" style={{ fontSize: '14px', color: '#1a5e20' }}>
                            {estudiantesEncontrados.map((c, i) => (
                              <li key={i}>{c["Curso"]} – {c["Sección (PEAD)"]} ({c["Turno"]})</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INFO DE CURSO AUTOMÁTICA - Solo para estudiantes USS con un solo curso */}
                  {estudiantesEncontrados.length === 1 && formData.curso && (
                    <>
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ 
                          backgroundColor: '#e8f5e1' 
                        }}>
                          <div className="fw-bold" style={{ color: '#63ed12' }}>Curso:</div>
                          <div>{formData.curso}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ 
                          backgroundColor: '#f0f7ff' 
                        }}>
                          <div className="fw-bold" style={{ color: '#5a2290' }}>Sección:</div>
                          <div>{formData.pead}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ 
                          backgroundColor: '#e8f5e1' 
                        }}>
                          <div className="fw-bold" style={{ color: '#63ed12' }}>Docente:</div>
                          <div>{formData.docente}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ 
                          backgroundColor: '#f0f7ff' 
                        }}>
                          <div className="fw-bold" style={{ color: '#5a2290' }}>Turno:</div>
                          <div>{formData.turno}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ 
                          backgroundColor: '#e8f5e1' 
                        }}>
                          <div className="fw-bold" style={{ color: '#63ed12' }}>Días:</div>
                          <div>{formData.dias}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ 
                          backgroundColor: '#f0f7ff' 
                        }}>
                          <div className="fw-bold" style={{ color: '#5a2290' }}>Horario:</div>
                          <div>{formData.horaInicio} - {formData.horaFin}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN DE CERTIFICADO - Para todos */}
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title mb-3">
                  <span style={{ color: '#5a2290' }}>🏆 SOLICITAR CERTIFICADO WEBINAR - S/ 10.00</span>
                </h6>
                <p className="text-muted mb-3">
                  ¿Deseas solicitar certificado digital del webinar?
                </p>
                
                <div className="d-flex flex-column gap-2">
                  {['si', 'no'].map(opt => (
                    <label key={opt} className="d-flex align-items-center p-3 rounded" style={{
                      cursor: 'pointer',
                      backgroundColor: formData.solicitaCertificado === opt ? '#63ed12' : 'transparent',
                      color: formData.solicitaCertificado === opt ? 'white' : '#202124',
                      border: '1px solid #dee2e6',
                      transition: 'all 0.25s ease'
                    }}>
                      <input
                        type="radio"
                        name="solicitaCertificado"
                        value={opt}
                        checked={formData.solicitaCertificado === opt}
                        onChange={handleChange}
                        disabled={loading}
                        className="me-3"
                        style={{ 
                          transform: 'scale(1.5)', 
                          accentColor: '#63ed12', 
                          cursor: 'pointer' 
                        }}
                      />
                      <span className={formData.solicitaCertificado === opt ? 'fw-bold' : ''}>
                        {opt === 'si' ? 'Sí, solicito certificado (S/ 10.00)' : 'No, solo registro de asistencia'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SECCIÓN DE COMENTARIOS - Para todos */}
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title mb-3">
                  <span style={{ color: '#5a2290' }}>💬 Déjanos tu opinión (opcional)</span>
                </h6>
                <textarea
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleChange}
                  rows={4}
                  placeholder="¿Qué te pareció el webinar? ¿Alguna sugerencia para próximos eventos?"
                  className="form-control"
                  style={{
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* BOTONES DE ENVIAR */}
            <div className="d-flex justify-content-between flex-wrap gap-3 mt-5">
              <button 
                onClick={() => {
                  if (tipoUsuario === 'uss') {
                    setPaso('login');
                  } else {
                    setPaso('seleccion');
                    setTipoUsuario('');
                  }
                }}
                disabled={loading}
                className="btn btn-outline-secondary"
              >
                Volver
              </button>

              <button 
                onClick={enviarEncuesta}
                disabled={loading || !formData.nombreCompleto || 
                  (tipoUsuario === 'externo' && !correoExterno)}
                className="btn"
                style={{
                  backgroundColor: (loading || !formData.nombreCompleto) ? '#f1f3f4' : '#5a2290',
                  color: (loading || !formData.nombreCompleto) ? '#9aa0a6' : 'white',
                  border: 'none'
                }}
              >
                {loading ? 'Enviando...' : 'Enviar encuesta'}
              </button>
            </div>

            {!formData.nombreCompleto && (
              <div className="alert alert-warning text-center mt-4">
                Completa el nombre completo para poder enviar la encuesta
              </div>
            )}


          </div>
        </div>
      </main>
    </div>
  );
};

export default EncuestaWebinar;
