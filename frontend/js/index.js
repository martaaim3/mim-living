document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('imgFull');
  const closeBtn = document.querySelector('.close-modal');


  // Selecciona todas las imágenes de las tarjetas
  const images = document.querySelectorAll('.card img');

  images.forEach(img => {
    img.addEventListener('click', () => {
      modal.style.display = "flex";
      modalImg.src = img.src;
    });
  });

  // Cerrar al hacer clic en la X o fuera de la imagen
  modal.onclick = (e) => {
    if (e.target !== modalImg) modal.style.display = "none";
  };

  
});