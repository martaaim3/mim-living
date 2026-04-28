document.addEventListener('DOMContentLoaded', async () => {
  const usuario = obtenerUsuario();

  if (!usuario) {
    window.location.href = 'index.html';
    return;
  }

  console.log('✅ Usuario logueado:', usuario.nombre);

  const welcomeText = document.getElementById('welcomeText');
  if (welcomeText) {
    welcomeText.textContent = `Bienvenida, ${usuario.nombre || 'usuario'}`;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('usuario');
      window.location.href = 'index.html';
    });
  }

  await cargarDashboard();
});

function obtenerUsuario() {
  const usuarioGuardado =
    localStorage.getItem('usuario') ||
    localStorage.getItem('usuarioActivo');

  if (!usuarioGuardado) return null;

  try {
    const usuario = JSON.parse(usuarioGuardado);

    if (!usuario || typeof usuario !== 'object') {
      return null;
    }

    if (!usuario.id && usuario.id_usuario) {
      usuario.id = usuario.id_usuario;
    }

    if (!usuario.id_usuario && usuario.id) {
      usuario.id_usuario = usuario.id;
    }

    if (!usuario.nombre && usuario.email) {
      usuario.nombre = usuario.email.split('@')[0];
    }

    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.removeItem('usuarioActivo');

    return usuario;
  } catch (error) {
    console.error('Error parseando usuario:', error);
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuarioActivo');
    return null;
  }
}

async function cargarDashboard() {
  try {
    const usuario = obtenerUsuario();
    const idUsuario = usuario?.id || usuario?.id_usuario;

    if (!usuario || !idUsuario) {
      console.warn('No hay usuario válido para cargar dashboard');
      renderContadores([], [], []);
      renderProyectosRecientes([]);
      return;
    }

    const proyectos = await obtenerProyectosUsuario(idUsuario);
    const estancias = await obtenerTodasLasEstancias(proyectos);

    // De momento no hay endpoint real general para diseños 3D
    const disenos = [];

    renderContadores(proyectos, estancias, disenos);
    renderProyectosRecientes(proyectos);
  } catch (error) {
    console.error('❌ Error cargando dashboard:', error);
    renderContadores([], [], []);
    renderProyectosRecientes([]);
  }
}

async function obtenerProyectosUsuario(idUsuario) {
  try {
    const response = await fetch(`/api/proyectos?id_usuario=${idUsuario}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error al cargar proyectos:', data);
      return [];
    }

    const proyectos = Array.isArray(data) ? data : (data.proyectos || []);
    console.log('✅ Proyectos cargados:', proyectos);
    return proyectos;
  } catch (error) {
    console.error('❌ Error de conexión cargando proyectos:', error);
    return [];
  }
}

async function obtenerTodasLasEstancias(proyectos) {
  if (!Array.isArray(proyectos) || proyectos.length === 0) return [];

  if (!window.api || !window.api.estancias || typeof window.api.estancias.listar !== 'function') {
    console.warn('⚠️ window.api.estancias.listar no está disponible en dashboard');
    return [];
  }

  const todas = [];

  for (const proyecto of proyectos) {
    const idProyecto = proyecto.id_proyecto || proyecto.id;
    if (!idProyecto) continue;

    try {
      console.log('📦 Cargando estancias del proyecto:', idProyecto);
      const data = await window.api.estancias.listar(idProyecto);
      console.log('📦 Respuesta estancias:', data);

      const estancias = Array.isArray(data) ? data : (data.estancias || []);
      todas.push(...estancias);
    } catch (error) {
      console.warn(`⚠️ No se pudieron cargar estancias del proyecto ${idProyecto}:`, error);
    }
  }

  console.log('✅ Total estancias:', todas.length);
  return todas;
}

function renderContadores(proyectos, estancias, disenos) {
  const totalProyectos = document.getElementById('totalProyectos');
  const totalEstancias = document.getElementById('totalEstancias');
  const totalDisenos = document.getElementById('totalDiseños');

  if (totalProyectos) totalProyectos.textContent = proyectos.length;
  if (totalEstancias) totalEstancias.textContent = estancias.length;
  if (totalDisenos) totalDisenos.textContent = disenos.length;

  console.log('📊 Contadores:', {
    proyectos: proyectos.length,
    estancias: estancias.length,
    disenos: disenos.length
  });
}

function renderProyectosRecientes(proyectos) {
  const container = document.getElementById('projectsContainer');
  if (!container) return;

  if (!Array.isArray(proyectos) || proyectos.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: var(--card); border-radius: 18px; border: 2px dashed var(--border);">
        <div style="font-size: 3em; margin-bottom: 15px;">📦</div>
        <p style="color: var(--muted); margin-bottom: 20px; font-size: 1.1em;">No tienes proyectos creados aún</p>
        <a href="project.html" class="btn btn-primary">Crear tu primer proyecto</a>
      </div>
    `;
    return;
  }

  const recientes = [...proyectos].slice(0, 4);

  container.innerHTML = recientes.map((proyecto) => {
    const id = proyecto.id_proyecto || proyecto.id || '';
    const nombre = escaparHTML(proyecto.nombre || 'Proyecto sin nombre');
    const descripcion = escaparHTML(proyecto.descripcion || 'Sin descripción');

    return `
      <div class="project-card">
        <div class="project-image">🏠</div>
        <div class="project-content">
          <h3 class="project-title">${nombre}</h3>
          <p class="project-description">${descripcion}</p>
          <div class="project-meta">
            <span class="project-badge">Proyecto</span>
            <span></span>
          </div>
          <div class="project-actions">
            <a href="estancias.html?proyectoId=${encodeURIComponent(id)}&nombre=${encodeURIComponent(proyecto.nombre || '')}" class="project-action-btn">Ver estancias</a>
            <a href="project.html?id=${encodeURIComponent(id)}&edit=true" class="project-action-btn">Editar</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  console.log('✅ Proyectos recientes renderizados:', recientes.length);
}

function escaparHTML(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function openContactModal() {
  const modal = document.getElementById('contactModal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflowY = 'hidden';
}

function closeContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) modal.classList.remove('active');

  document.body.style.overflowY = 'auto';

  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (form) {
    form.reset();
    form.style.display = 'block';
  }

  if (formSuccess) formSuccess.style.display = 'none';
  if (loadingSpinner) loadingSpinner.style.display = 'none';
}

function submitContactForm(event) {
  event.preventDefault();

  const data = {
    nombre: document.getElementById('contactName')?.value || '',
    email: document.getElementById('contactEmail')?.value || '',
    telefono: document.getElementById('contactPhone')?.value || '',
    asunto: document.getElementById('contactSubject')?.value || '',
    mensaje: document.getElementById('contactMessage')?.value || ''
  };

  const spinner = document.getElementById('loadingSpinner');
  const form = document.getElementById('contactForm');

  if (spinner) spinner.style.display = 'block';
  if (form) form.style.display = 'none';

  fetch('/api/contacto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(r => r.json())
    .then(result => {
      if (spinner) spinner.style.display = 'none';

      if (result.success) {
        const success = document.getElementById('formSuccess');
        if (success) success.style.display = 'block';
        setTimeout(() => closeContactModal(), 2000);
      } else {
        alert('Error: ' + (result.message || 'No se pudo enviar el mensaje'));
        if (form) form.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      if (spinner) spinner.style.display = 'none';
      if (form) form.style.display = 'block';
      alert('Error al enviar');
    });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeContactModal();
});

document.addEventListener('click', (e) => {
  const modal = document.getElementById('contactModal');
  if (modal && e.target === modal) closeContactModal();
});