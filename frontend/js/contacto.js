  // ===== FUNCIONES MODAL CONTACTO =====

    function openContactModal() {
      document.getElementById('contactModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeContactModal() {
      document.getElementById('contactModal').classList.remove('active');
      document.body.style.overflow = 'auto';
      resetContactForm();
    }

    function resetContactForm() {
      document.getElementById('contactForm').reset();
      document.getElementById('formSuccess').classList.remove('active');
      document.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));
    }

    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    function validateForm() {
      let isValid = true;
      const form = document.getElementById('contactForm');
      const fields = form.querySelectorAll('input[required], textarea[required]');

      fields.forEach(field => {
        const group = field.parentElement;
        
        if (field.type === 'email') {
          if (!validateEmail(field.value)) {
            group.classList.add('error');
            isValid = false;
          } else {
            group.classList.remove('error');
          }
        } else {
          if (!field.value.trim()) {
            group.classList.add('error');
            isValid = false;
          } else {
            group.classList.remove('error');
          }
        }
      });

      return isValid;
    }

    function submitContactForm(event) {
      event.preventDefault();

      if (!validateForm()) {
        alert('Por favor completa todos los campos correctamente');
        return;
      }

      const form = document.getElementById('contactForm');
      const data = {
        nombre: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        telefono: document.getElementById('contactPhone').value,
        asunto: document.getElementById('contactSubject').value,
        mensaje: document.getElementById('contactMessage').value,
        fecha: new Date().toISOString()
      };

      // Mostrar loading
      document.getElementById('loadingSpinner').classList.add('active');
      form.style.display = 'none';

      // Enviar mensaje
      setTimeout(() => {
        enviarMensajeContacto(data);
      }, 1000);
    }

    function enviarMensajeContacto(data) {
      fetch('/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          mostrarExito();
        } else {
          throw new Error(result.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('❌ Error al enviar el mensaje. Intenta de nuevo.');
        document.getElementById('loadingSpinner').classList.remove('active');
        document.getElementById('contactForm').style.display = 'block';
      });
    }

    function mostrarExito() {
      document.getElementById('loadingSpinner').classList.remove('active');
      document.getElementById('contactForm').style.display = 'none';
      document.getElementById('formSuccess').classList.add('active');

      setTimeout(() => {
        closeContactModal();
      }, 3000);
    }

    // Cerrar modal al hacer clic fuera
    document.getElementById('contactModal').addEventListener('click', (e) => {
      if (e.target.id === 'contactModal') {
        closeContactModal();
      }
    });

    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeContactModal();
      }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('usuario');
      location.href = 'login.html';
    });