
class Plano3DApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.orbitControls = null;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.estanciaId = null;
    this.disenoId = null;
    this.estancia = { nombre: 'Mi estancia', ancho: 6, largo: 5, alto: 2.8 };

    this.floorMesh = null;
    this.ceilingMesh = null;
    this.gridHelper = null;
    this.wallGroup = new THREE.Group();
    this.furnitureGroup = new THREE.Group();
    this.roomZoneGroup = new THREE.Group();
    this.selectionBox = null;
    this.hoverPointMesh = null;

    this.catalogo = [];
    this.walls = [];
    this.muebles = [];
    this.selectedEntity = null;
    this.currentMode = 'move';
    this.currentToolCategory = 'sofas';
    this.pendingWallStart = null;
    this.isDraggingFurniture = false;
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.dragOffset = new THREE.Vector3();
    this.dragTarget = new THREE.Vector3();
    this.walkEnabled = false;
    this.keys = {};
    this.walkVelocity = new THREE.Vector3();

    this.defaultWallColor = '#e8ddd2';
    this.defaultFloorColor = '#efe7de';
    this.defaultWallHeight = 2.8;
    this.defaultWallThickness = 0.12;

    this.state = {
      planImage: null,
      wallColor: this.defaultWallColor,
      floorColor: this.defaultFloorColor,
      wallHeight: this.defaultWallHeight,
      wallThickness: this.defaultWallThickness
    };

    this.init();
  }

  async init() {
    this.cacheDom();
    this.readUrlParams();
    this.seedCatalog();
    this.initThree();
    this.createBaseScene();
    this.bindEvents();
    await this.loadEstancia();
    this.syncInputsFromState();
    this.setMode('move');
    this.createPerimeterWalls();
    await this.tryLoadExistingDesign();
    this.renderFurnitureCatalog();
    this.updateSummary();
    this.setEditorView('3d');
    this.animate();
    this.hideLoading();
  }

  cacheDom() {
    this.dom = {
      canvas: document.getElementById('canvas3d'),
      uploadPlano: document.getElementById('uploadPlano'),
      btnGuardar: document.getElementById('btnGuardarDiseno'),
      btnLimpiar: document.getElementById('btnLimpiarEscena'),
      btnGenerarPerimetro: document.getElementById('btnGenerarPerimetro'),
      btnGenerarEstanciasDemo: document.getElementById('btnGenerarEstanciasDemo'),
      btnEliminarSeleccion: document.getElementById('btnEliminarSeleccion'),
      btnDuplicarMueble: document.getElementById('btnDuplicarMueble'),
      btnRotarIzquierda: document.getElementById('btnRotarIzquierda'),
      btnRotarDerecha: document.getElementById('btnRotarDerecha'),
      btnResetCamara: document.getElementById('btnResetCamara'),
      btnVistaPlano: document.getElementById('btnVistaPlano'),
      btnVista3d: document.getElementById('btnVista3d'),
      btnVistaRecorrido: document.getElementById('btnVistaRecorrido'),
      btnAutoAmueblar: document.getElementById('btnAutoAmueblar'),
      btnProcesarPlano: document.getElementById('btnProcesarPlano'),
      btnBorrarPlano: document.getElementById('btnBorrarPlano'),
      btnAplicarColorParedSeleccionada: document.getElementById('btnAplicarColorParedSeleccionada'),
      btnAplicarColorSuelo: document.getElementById('btnAplicarColorSuelo'),
      btnModoSeleccion: document.getElementById('btnModoSeleccion'),
      btnModoPared: document.getElementById('btnModoPared'),
      btnModoEliminarPared: document.getElementById('btnModoEliminarPared'),
      btnModoPintarPared: document.getElementById('btnModoPintarPared'),
      btnModoMover: document.getElementById('btnModoMover'),
      navModeIndicator: document.getElementById('navModeIndicator'),
      nombreEstancia: document.getElementById('nombreEstancia'),
      dimensionesEstancia: document.getElementById('dimensionesEstancia'),
      estadoEditor: document.getElementById('estadoEditor'),
      seleccionInfo: document.getElementById('seleccionInfo'),
      totalMuebles: document.getElementById('totalMuebles'),
      totalParedes: document.getElementById('totalParedes'),
      ultimaActualizacion: document.getElementById('ultimaActualizacion'),
      planPreview: document.getElementById('planPreview'),
      wallColor: document.getElementById('wallColor'),
      floorColor: document.getElementById('floorColor'),
      wallHeight: document.getElementById('wallHeight'),
      wallThickness: document.getElementById('wallThickness'),
      wallHeightValue: document.getElementById('wallHeightValue'),
      wallThicknessValue: document.getElementById('wallThicknessValue'),
      mueblesList: document.getElementById('mueblesList'),
      categoriasContainer: document.getElementById('categoriasContainer'),
      loadingViewport: document.getElementById('loadingViewport')
    };
  }

  readUrlParams() {
    const params = new URLSearchParams(window.location.search);
    this.estanciaId = params.get('estanciaId');
    this.disenoId = params.get('disenoId');
  }

  seedCatalog() {
    this.catalogo = [
      { id: 'sofa-1', categoria: 'sofas', nombre: 'Sofá moderno', tipo: 'sofa', color: 0xc4a484, ancho: 2.2, profundo: 0.95, alto: 0.82 },
      { id: 'sofa-2', categoria: 'sofas', nombre: 'Sofá esquinero', tipo: 'sofa-l', color: 0x8e7b68, ancho: 2.8, profundo: 1.8, alto: 0.82 },
      { id: 'mesa-1', categoria: 'mesas', nombre: 'Mesa centro', tipo: 'mesa-centro', color: 0xb9986d, ancho: 1.2, profundo: 0.7, alto: 0.42 },
      { id: 'mesa-2', categoria: 'mesas', nombre: 'Mesa comedor', tipo: 'mesa-comedor', color: 0x8b6f47, ancho: 1.8, profundo: 0.9, alto: 0.75 },
      { id: 'silla-1', categoria: 'sillas', nombre: 'Silla nórdica', tipo: 'silla', color: 0xd4b08c, ancho: 0.5, profundo: 0.55, alto: 0.9 },
      { id: 'silla-2', categoria: 'sillas', nombre: 'Silla tapizada', tipo: 'silla', color: 0x9f876d, ancho: 0.55, profundo: 0.6, alto: 0.95 },
      { id: 'cocina-1', categoria: 'cocina', nombre: 'Módulo cocina', tipo: 'modulo-cocina', color: 0xcfcfcf, ancho: 1.8, profundo: 0.62, alto: 0.92 },
      { id: 'bano-1', categoria: 'bano', nombre: 'Lavabo', tipo: 'lavabo', color: 0xf5f5f5, ancho: 0.6, profundo: 0.45, alto: 0.85 },
      { id: 'bano-2', categoria: 'bano', nombre: 'Inodoro', tipo: 'wc', color: 0xffffff, ancho: 0.4, profundo: 0.65, alto: 0.8 },
      { id: 'decor-1', categoria: 'decoracion', nombre: 'Lámpara pie', tipo: 'lampara', color: 0x2f2a26, ancho: 0.35, profundo: 0.35, alto: 1.7 },
      { id: 'decor-2', categoria: 'decoracion', nombre: 'Planta', tipo: 'planta', color: 0x688b45, ancho: 0.45, profundo: 0.45, alto: 1.1 }
    ];
  }

  initThree() {
    const container = this.dom.canvas.parentElement;
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 800;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd9d0c8);
    this.scene.fog = new THREE.Fog(0xd9d0c8, 18, 40);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);
    this.camera.position.set(6, 6, 6);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.dom.canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.target.set(0, 1.2, 0);
    this.orbitControls.maxPolarAngle = Math.PI * 0.49;
    this.orbitControls.minDistance = 2;
    this.orbitControls.maxDistance = 28;
    this.orbitControls.enablePan = true;
    this.orbitControls.screenSpacePanning = false;

    const hemi = new THREE.HemisphereLight(0xffffff, 0xbba48b, 0.9);
    hemi.position.set(0, 12, 0);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(7, 12, 8);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 40;
    dir.shadow.camera.left = -20;
    dir.shadow.camera.right = 20;
    dir.shadow.camera.top = 20;
    dir.shadow.camera.bottom = -20;
    this.scene.add(dir);

    this.scene.add(this.roomZoneGroup);
    this.scene.add(this.wallGroup);
    this.scene.add(this.furnitureGroup);

    this.gridHelper = new THREE.GridHelper(20, 40, 0xc9beb3, 0xd9cfc6);
    this.gridHelper.position.y = 0.002;
    this.scene.add(this.gridHelper);

    const hoverGeom = new THREE.SphereGeometry(0.06, 16, 16);
    const hoverMat = new THREE.MeshBasicMaterial({ color: 0x55735c });
    this.hoverPointMesh = new THREE.Mesh(hoverGeom, hoverMat);
    this.hoverPointMesh.visible = false;
    this.scene.add(this.hoverPointMesh);
  }

  createBaseScene() {
    const floorGeom = new THREE.PlaneGeometry(this.estancia.ancho, this.estancia.largo);
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.state.floorColor),
      roughness: 0.95,
      metalness: 0.02,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1
    });

    this.floorMesh = new THREE.Mesh(floorGeom, floorMat);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.receiveShadow = true;
    this.floorMesh.userData.entityType = 'floor';
    this.scene.add(this.floorMesh);

    const ceilingGeom = new THREE.PlaneGeometry(this.estancia.ancho, this.estancia.largo);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xf7f3ee,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide
    });
    this.ceilingMesh = new THREE.Mesh(ceilingGeom, ceilingMat);
    this.ceilingMesh.rotation.x = Math.PI / 2;
    this.ceilingMesh.position.y = this.estancia.alto;
    this.ceilingMesh.visible = false;
    this.scene.add(this.ceilingMesh);

    const axes = new THREE.AxesHelper(1.5);
    axes.position.set(-this.estancia.ancho / 2 - 0.6, 0.01, -this.estancia.largo / 2 - 0.6);
    this.scene.add(axes);
  }

  async loadEstancia() {
    if (!this.estanciaId) {
      this.refreshRoomMeshes();
      this.updateEstanciaUI();
      return;
    }

    try {
      const response = await fetch(`/api/estancias/${this.estanciaId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const estancia = await response.json();
      this.estancia = {
        nombre: estancia.nombre || 'Mi estancia',
        ancho: Number(estancia.ancho) || 6,
        largo: Number(estancia.largo) || 5,
        alto: Number(estancia.alto) || 2.8
      };
      this.state.wallHeight = this.estancia.alto;
    } catch (error) {
      console.warn('No se pudo cargar la estancia, se usan valores por defecto.', error);
    }

    this.refreshRoomMeshes();
    this.updateEstanciaUI();
  }

  updateEstanciaUI() {
    this.dom.nombreEstancia.textContent = this.estancia.nombre;
    this.dom.dimensionesEstancia.textContent = `${this.estancia.ancho.toFixed(2)}m × ${this.estancia.largo.toFixed(2)}m × ${this.estancia.alto.toFixed(2)}m`;
  }

  refreshRoomMeshes() {
    if (this.floorMesh) {
      this.floorMesh.geometry.dispose();
      this.floorMesh.geometry = new THREE.PlaneGeometry(this.estancia.ancho, this.estancia.largo);
    }
    if (this.ceilingMesh) {
      this.ceilingMesh.geometry.dispose();
      this.ceilingMesh.geometry = new THREE.PlaneGeometry(this.estancia.ancho, this.estancia.largo);
      this.ceilingMesh.position.y = this.state.wallHeight;
    }
    if (this.orbitControls) {
      this.orbitControls.target.set(0, Math.min(1.2, this.state.wallHeight * 0.5), 0);
      this.orbitControls.update();
    }
    this.updatePlanMaterialForView?.();
  }

  clearRoomZones() {
    while (this.roomZoneGroup.children.length) {
      const child = this.roomZoneGroup.children.pop();
      child.geometry?.dispose?.();
      child.material?.map?.dispose?.();
      child.material?.dispose?.();
    }
  }

  createLabelSprite(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = 'rgba(90,70,50,0.18)';
    ctx.lineWidth = 4;
    const radius = 26;
    const x = 8;
    const y = 8;
    const w = canvas.width - 16;
    const h = canvas.height - 16;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2f2a26';
    ctx.font = '700 42px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.7, 0.52, 1);
    return sprite;
  }

  createRoomZones(zones = []) {
    this.clearRoomZones();
    zones.forEach((zone) => {
      const geom = new THREE.PlaneGeometry(zone.width, zone.depth);
      const mat = new THREE.MeshBasicMaterial({
        color: zone.color || '#ffffff',
        transparent: true,
        opacity: this.viewMode === 'plan' ? 0.2 : 0.12,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(zone.x, 0.018, zone.z);
      mesh.userData.entityType = 'room-zone';
      this.roomZoneGroup.add(mesh);

      const label = this.createLabelSprite(zone.label);
      label.position.set(zone.x, 0.03, zone.z);
      this.roomZoneGroup.add(label);
    });
  }

  updateRoomZonesForView() {
    const isPlan = this.viewMode === 'plan';
    this.roomZoneGroup.children.forEach((child) => {
      if (child.isMesh && child.material) {
        child.material.opacity = isPlan ? 0.2 : 0.12;
      }
      if (child.isSprite) {
        child.visible = true;
        child.scale.set(isPlan ? 1.5 : 1.9, isPlan ? 0.46 : 0.58, 1);
      }
    });
  }

  createDemoApartmentLayout() {
    if (!window.confirm('Se generará una distribución demo con estancias interiores y mobiliario básico para la presentación.')) {
      return;
    }

    const w = this.estancia.ancho;
    const d = this.estancia.largo;
    const left = -w / 2;
    const right = w / 2;
    const top = -d / 2;
    const bottom = d / 2;

    const splitX = left + w * 0.56;
    const bathTop = top + d * 0.58;
    const closetLeft = left + w * 0.82;
    const closetTop = top + d * 0.66;

    this.walls = [
      this.makeWallData({ x: left, z: top }, { x: right, z: top }),
      this.makeWallData({ x: right, z: top }, { x: right, z: bottom }),
      this.makeWallData({ x: right, z: bottom }, { x: left, z: bottom }),
      this.makeWallData({ x: left, z: bottom }, { x: left, z: top }),
      this.makeWallData({ x: splitX, z: top }, { x: splitX, z: bathTop - 0.2 }),
      this.makeWallData({ x: splitX + 0.05, z: bathTop }, { x: closetLeft - 0.4, z: bathTop }),
      this.makeWallData({ x: closetLeft, z: bathTop + 0.1 }, { x: closetLeft, z: bottom }),
      this.makeWallData({ x: closetLeft - 0.55, z: closetTop }, { x: right - 0.2, z: closetTop })
    ];
    this.rebuildWalls();

    const zones = [
      { label: 'SALÓN', x: left + w * 0.28, z: top + d * 0.25, width: w * 0.50, depth: d * 0.42, color: '#f0e3d6' },
      { label: 'DORMITORIO', x: splitX + (right - splitX) * 0.5, z: top + d * 0.25, width: (right - splitX) * 0.86, depth: d * 0.42, color: '#e7ebf2' },
      { label: 'COCINA', x: left + w * 0.18, z: bathTop + (bottom - bathTop) * 0.48, width: w * 0.30, depth: (bottom - bathTop) * 0.78, color: '#f6ecd6' },
      { label: 'BAÑO', x: splitX + (closetLeft - splitX) * 0.46, z: bathTop + (bottom - bathTop) * 0.5, width: (closetLeft - splitX) * 0.78, depth: (bottom - bathTop) * 0.78, color: '#e5eef0' },
      { label: 'VESTIDOR', x: closetLeft + (right - closetLeft) * 0.46, z: closetTop + (bottom - closetTop) * 0.5, width: (right - closetLeft) * 0.72, depth: (bottom - closetTop) * 0.72, color: '#efe8f5' }
    ];
    this.createRoomZones(zones);

    this.clearFurniture(false);
    const addById = (id, overrides = {}) => {
      const item = this.catalogo.find((entry) => entry.id === id);
      if (!item) return null;
      return this.addFurniture(item, { ...overrides, id: this.uid('furniture'), catalogId: item.id });
    };

    addById('sofa-1', { posicion: { x: left + w * 0.28, y: 0.41, z: top + d * 0.28 }, rotacion: Math.PI / 2 });
    addById('mesa-1', { posicion: { x: left + w * 0.32, y: 0.21, z: top + d * 0.38 }, rotacion: 0 });
    addById('cocina-1', { posicion: { x: left + w * 0.16, y: 0.46, z: bottom - 0.45 }, rotacion: 0 });
    addById('mesa-2', { posicion: { x: left + w * 0.36, y: 0.375, z: bottom - 0.8 }, rotacion: Math.PI / 2 });
    addById('bano-1', { posicion: { x: splitX + 0.55, y: 0.425, z: bottom - 0.72 }, rotacion: 0 });
    addById('bano-2', { posicion: { x: splitX + 1.15, y: 0.4, z: bottom - 0.98 }, rotacion: 0 });
    addById('decor-2', { posicion: { x: splitX + 1.65, y: 0.55, z: top + 1.15 }, rotacion: 0 });
    addById('decor-1', { posicion: { x: right - 0.55, y: 0.85, z: bottom - 0.7 }, rotacion: 0 });

    this.setEditorView('3d');
    this.estado('Distribución demo creada con estancias interiores visibles y mobiliario básico.');
    this.updateSelectionPanel();
  }



  createPerimeterWalls() {
    const w = this.estancia.ancho;
    const d = this.estancia.largo;
    this.walls = [
      this.makeWallData({ x: -w / 2, z: -d / 2 }, { x: w / 2, z: -d / 2 }),
      this.makeWallData({ x: w / 2, z: -d / 2 }, { x: w / 2, z: d / 2 }),
      this.makeWallData({ x: w / 2, z: d / 2 }, { x: -w / 2, z: d / 2 }),
      this.makeWallData({ x: -w / 2, z: d / 2 }, { x: -w / 2, z: -d / 2 })
    ];
    this.rebuildWalls();
    this.clearRoomZones();
  }

  makeWallData(start, end, partial = {}) {
    return {
      id: partial.id || this.uid('wall'),
      start: { x: start.x, z: start.z },
      end: { x: end.x, z: end.z },
      height: Number(partial.height || this.state.wallHeight),
      thickness: Number(partial.thickness || this.state.wallThickness),
      color: partial.color || this.state.wallColor
    };
  }

  rebuildWalls() {
    while (this.wallGroup.children.length) {
      const child = this.wallGroup.children.pop();
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => mat.dispose?.());
      } else {
        child.material?.dispose?.();
      }
    }

    this.walls.forEach((wall) => {
      const mesh = this.buildWallMesh(wall);
      this.wallGroup.add(mesh);
    });

    this.updateSummary();
  }

  buildWallMesh(wall) {
    const dx = wall.end.x - wall.start.x;
    const dz = wall.end.z - wall.start.z;
    const length = Math.max(Math.hypot(dx, dz), 0.001);
    const geometry = new THREE.BoxGeometry(length, wall.height, wall.thickness);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(wall.color),
      roughness: 0.9,
      metalness: 0.03
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set((wall.start.x + wall.end.x) / 2, wall.height / 2, (wall.start.z + wall.end.z) / 2);
    mesh.rotation.y = Math.atan2(dz, dx);
    mesh.userData = { entityType: 'wall', entityId: wall.id };
    return mesh;
  }

  renderFurnitureCatalog() {
    const list = this.dom.mueblesList;
    list.innerHTML = '';
    const currentItems = this.catalogo.filter((item) => item.categoria === this.currentToolCategory);
    currentItems.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mueble-item';
      button.innerHTML = `
        <strong>${item.nombre}</strong>
        <small>${item.ancho.toFixed(2)}m × ${item.profundo.toFixed(2)}m</small>
      `;
      button.addEventListener('click', () => this.addFurniture(item));
      list.appendChild(button);
    });
  }

  addFurniture(item, savedData = null) {
    const entity = {
      id: savedData?.id || this.uid('furniture'),
      catalogId: item.id,
      nombre: item.nombre,
      tipo: item.tipo,
      categoria: item.categoria,
      color: savedData?.color || `#${item.color.toString(16).padStart(6, '0')}`,
      ancho: savedData?.ancho || item.ancho,
      profundo: savedData?.profundo || item.profundo,
      alto: savedData?.alto || item.alto,
      posicion: savedData?.posicion || { x: 0, y: item.alto / 2, z: 0 },
      rotacion: savedData?.rotacion || 0
    };
    const mesh = this.buildFurnitureMesh(entity);
    this.muebles.push(entity);
    this.furnitureGroup.add(mesh);
    this.selectEntity({ type: 'furniture', id: entity.id, mesh });
    this.updateSummary();
    return entity;
  }

  buildFurnitureMesh(data) {
    let root = new THREE.Group();
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(data.color),
      roughness: 0.8,
      metalness: 0.05
    });
    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x4d4338,
      roughness: 0.85,
      metalness: 0.08
    });
    const whiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.9,
      metalness: 0.02
    });

    const createLeg = (x, z, height, thickness = 0.06) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, thickness), darkMaterial);
      leg.position.set(x, height / 2, z);
      leg.castShadow = true;
      return leg;
    };

    switch (data.tipo) {
      case 'sofa': {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(data.ancho, 0.34, data.profundo), baseMaterial);
        seat.position.y = 0.34;
        const back = new THREE.Mesh(new THREE.BoxGeometry(data.ancho, 0.45, 0.14), baseMaterial);
        back.position.set(0, 0.73, -data.profundo / 2 + 0.07);
        const armLeft = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, data.profundo), baseMaterial);
        armLeft.position.set(-data.ancho / 2 + 0.08, 0.5, 0);
        const armRight = armLeft.clone();
        armRight.position.x = data.ancho / 2 - 0.08;
        root.add(seat, back, armLeft, armRight);
        break;
      }
      case 'sofa-l': {
        const longSeat = new THREE.Mesh(new THREE.BoxGeometry(data.ancho, 0.34, 0.9), baseMaterial);
        longSeat.position.set(0, 0.34, -0.45);
        const sideSeat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.34, data.profundo), baseMaterial);
        sideSeat.position.set(data.ancho / 2 - 0.45, 0.34, 0);
        const backLong = new THREE.Mesh(new THREE.BoxGeometry(data.ancho, 0.45, 0.14), baseMaterial);
        backLong.position.set(0, 0.73, -0.9 + 0.07);
        const backSide = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, data.profundo), baseMaterial);
        backSide.position.set(data.ancho / 2 - 0.9 + 0.07, 0.73, 0);
        root.add(longSeat, sideSeat, backLong, backSide);
        break;
      }
      case 'mesa-centro':
      case 'mesa-comedor': {
        const topThickness = 0.06;
        const top = new THREE.Mesh(new THREE.BoxGeometry(data.ancho, topThickness, data.profundo), baseMaterial);
        top.position.y = data.alto - topThickness / 2;
        root.add(top);
        const legHeight = data.alto - topThickness;
        const offsetX = data.ancho / 2 - 0.08;
        const offsetZ = data.profundo / 2 - 0.08;
        root.add(
          createLeg(-offsetX, -offsetZ, legHeight),
          createLeg(offsetX, -offsetZ, legHeight),
          createLeg(-offsetX, offsetZ, legHeight),
          createLeg(offsetX, offsetZ, legHeight)
        );
        break;
      }
      case 'silla': {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(data.ancho, 0.06, data.profundo), baseMaterial);
        seat.position.y = 0.48;
        root.add(seat);
        root.add(
          createLeg(-data.ancho / 2 + 0.05, -data.profundo / 2 + 0.05, 0.48, 0.05),
          createLeg(data.ancho / 2 - 0.05, -data.profundo / 2 + 0.05, 0.48, 0.05),
          createLeg(-data.ancho / 2 + 0.05, data.profundo / 2 - 0.05, 0.48, 0.05),
          createLeg(data.ancho / 2 - 0.05, data.profundo / 2 - 0.05, 0.48, 0.05)
        );
        const back = new THREE.Mesh(new THREE.BoxGeometry(data.ancho, 0.42, 0.05), baseMaterial);
        back.position.set(0, 0.72, -data.profundo / 2 + 0.025);
        root.add(back);
        break;
      }
      case 'modulo-cocina': {
        const body = new THREE.Mesh(new THREE.BoxGeometry(data.ancho, data.alto, data.profundo), baseMaterial);
        body.position.y = data.alto / 2;
        const worktop = new THREE.Mesh(new THREE.BoxGeometry(data.ancho + 0.03, 0.04, data.profundo + 0.03), darkMaterial);
        worktop.position.y = data.alto + 0.02;
        root.add(body, worktop);
        break;
      }
      case 'lavabo': {
        const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.55, 24), whiteMaterial);
        pedestal.position.y = 0.275;
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.18, 0.16, 28), whiteMaterial);
        bowl.position.y = 0.63;
        root.add(pedestal, bowl);
        break;
      }
      case 'wc': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.55), whiteMaterial);
        base.position.y = 0.21;
        const tank = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.35, 0.16), whiteMaterial);
        tank.position.set(0, 0.56, -0.19);
        root.add(base, tank);
        break;
      }
      case 'lampara': {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.03, 18), darkMaterial);
        base.position.y = 0.015;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.45, 12), darkMaterial);
        pole.position.y = 0.75;
        const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.32, 24), baseMaterial);
        shade.position.y = 1.52;
        root.add(base, pole, shade);
        break;
      }
      case 'planta': {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.28, 18), new THREE.MeshStandardMaterial({ color: 0x9c6b44 }));
        pot.position.y = 0.14;
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), new THREE.MeshStandardMaterial({ color: 0x5f8a49 }));
        bush.position.y = 0.55;
        root.add(pot, bush);
        break;
      }
      default: {
        const box = new THREE.Mesh(new THREE.BoxGeometry(data.ancho, data.alto, data.profundo), baseMaterial);
        box.position.y = data.alto / 2;
        root.add(box);
      }
    }

    root.position.set(data.posicion.x, data.posicion.y, data.posicion.z);
    root.rotation.y = data.rotacion;
    root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    root.userData = { entityType: 'furniture', entityId: data.id };
    return root;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));

    this.renderer.domElement.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    this.renderer.domElement.addEventListener('pointermove', (event) => this.onPointerMove(event));
    this.renderer.domElement.addEventListener('pointerup', () => this.onPointerUp());
    this.renderer.domElement.addEventListener('pointerleave', () => this.onPointerUp());

    this.dom.categoriasContainer.querySelectorAll('.categoria-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.dom.categoriasContainer.querySelectorAll('.categoria-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentToolCategory = btn.dataset.categoria;
        this.renderFurnitureCatalog();
      });
    });

    this.dom.uploadPlano.addEventListener('change', (event) => this.handlePlanUpload(event));
    this.dom.btnProcesarPlano.addEventListener('click', () => this.dom.uploadPlano.click());
    this.dom.btnBorrarPlano.addEventListener('click', () => this.clearPlanTexture());

    this.dom.btnGuardar.addEventListener('click', () => this.saveDesign());
    this.dom.btnLimpiar.addEventListener('click', () => this.clearFurniture());
    this.dom.btnGenerarPerimetro.addEventListener('click', () => this.confirmRebuildPerimeter());
    this.dom.btnGenerarEstanciasDemo?.addEventListener('click', () => this.createDemoApartmentLayout());
    this.dom.btnEliminarSeleccion.addEventListener('click', () => this.deleteSelection());
    this.dom.btnDuplicarMueble.addEventListener('click', () => this.duplicateSelectedFurniture());
    this.dom.btnRotarIzquierda.addEventListener('click', () => this.rotateSelected(-Math.PI / 12));
    this.dom.btnRotarDerecha.addEventListener('click', () => this.rotateSelected(Math.PI / 12));
    this.dom.btnResetCamara.addEventListener('click', () => this.resetCamera());
    this.dom.btnVistaPlano?.addEventListener('click', () => this.setEditorView('plan'));
    this.dom.btnVista3d.addEventListener('click', () => this.setEditorView('3d'));
    this.dom.btnVistaRecorrido.addEventListener('click', () => this.setEditorView('walk'));
    this.dom.btnAutoAmueblar?.addEventListener('click', () => this.autoStageRoom());

    this.dom.btnModoSeleccion.addEventListener('click', () => this.setMode('select'));
    this.dom.btnModoPared.addEventListener('click', () => this.setMode('draw-wall'));
    this.dom.btnModoEliminarPared.addEventListener('click', () => this.setMode('delete-wall'));
    this.dom.btnModoPintarPared.addEventListener('click', () => this.setMode('paint-wall'));
    this.dom.btnModoMover.addEventListener('click', () => this.setMode('move'));

    this.dom.btnAplicarColorParedSeleccionada.addEventListener('click', () => this.applyWallColor());
    this.dom.btnAplicarColorSuelo.addEventListener('click', () => this.applyFloorColor());

    this.dom.wallColor.addEventListener('input', () => {
      this.state.wallColor = this.dom.wallColor.value;
    });

    this.dom.floorColor.addEventListener('input', () => {
      this.state.floorColor = this.dom.floorColor.value;
      this.applyFloorColor();
    });

    this.dom.wallHeight.addEventListener('input', () => {
      this.state.wallHeight = Number(this.dom.wallHeight.value);
      this.dom.wallHeightValue.textContent = `${this.state.wallHeight.toFixed(2)} m`;
      this.ceilingMesh.position.y = this.state.wallHeight;
    });

    this.dom.wallThickness.addEventListener('input', () => {
      this.state.wallThickness = Number(this.dom.wallThickness.value);
      this.dom.wallThicknessValue.textContent = `${this.state.wallThickness.toFixed(2)} m`;
    });

    document.querySelectorAll('[data-color-target]').forEach((button) => {
      button.addEventListener('click', () => {
        const color = button.dataset.color;
        const target = button.dataset.colorTarget;
        if (target === 'wall') {
          this.dom.wallColor.value = color;
          this.state.wallColor = color;
        } else {
          this.dom.floorColor.value = color;
          this.state.floorColor = color;
          this.applyFloorColor();
        }
      });
    });
  }

  syncInputsFromState() {
    this.dom.wallColor.value = this.state.wallColor;
    this.dom.floorColor.value = this.state.floorColor;
    this.dom.wallHeight.value = String(this.state.wallHeight);
    this.dom.wallThickness.value = String(this.state.wallThickness);
    this.dom.wallHeightValue.textContent = `${this.state.wallHeight.toFixed(2)} m`;
    this.dom.wallThicknessValue.textContent = `${this.state.wallThickness.toFixed(2)} m`;
  }

  setMode(mode) {
    this.currentMode = mode;
    this.pendingWallStart = null;
    this.isDraggingFurniture = false;

    const buttons = [
      ['select', this.dom.btnModoSeleccion],
      ['draw-wall', this.dom.btnModoPared],
      ['delete-wall', this.dom.btnModoEliminarPared],
      ['paint-wall', this.dom.btnModoPintarPared],
      ['move', this.dom.btnModoMover]
    ];

    buttons.forEach(([buttonMode, button]) => {
      button.classList.toggle('active', mode === buttonMode);
    });

    const labels = {
      select: 'Selecciona paredes o muebles',
      'draw-wall': 'Haz clic en un punto y luego en otro para dibujar una pared',
      'delete-wall': 'Haz clic en una pared para eliminarla',
      'paint-wall': 'Haz clic en una pared para pintarla',
      move: 'Haz clic en un mueble y arrástralo para recolocarlo'
    };

    this.dom.estadoEditor.textContent = labels[mode] || '';
  }


  setEditorView(view) {
    this.viewMode = view;
    this.walkEnabled = view === 'walk';

    this.dom.btnVistaPlano?.classList.toggle('active', view === 'plan');
    this.dom.btnVista3d.classList.toggle('active', view === '3d');
    this.dom.btnVistaRecorrido.classList.toggle('active', view === 'walk');

    if (view === 'walk') {
      this.dom.navModeIndicator.textContent = '🚶 Recorrido inmersivo';
      this.orbitControls.enabled = false;
      this.ceilingMesh.visible = false;
      this.camera.position.set(0, 1.65, Math.max(1.5, this.estancia.largo / 2 - 0.8));
      this.camera.lookAt(0, 1.55, 0);
    } else {
      this.orbitControls.enabled = true;
      this.ceilingMesh.visible = false;
      if (view === 'plan') {
        this.dom.navModeIndicator.textContent = '📐 Plano 2D para delimitar muros';
        const dist = Math.max(this.estancia.ancho, this.estancia.largo) * 0.9;
        this.camera.position.set(0, Math.max(9, dist * 1.7), 0.001);
        this.orbitControls.target.set(0, 0, 0);
        this.orbitControls.minPolarAngle = 0;
        this.orbitControls.maxPolarAngle = 0.02;
        this.orbitControls.enableRotate = false;
        this.orbitControls.update();
      } else {
        this.dom.navModeIndicator.textContent = '🏠 Vista 3D del proyecto';
        this.orbitControls.enableRotate = true;
        this.orbitControls.minPolarAngle = 0.2;
        this.orbitControls.maxPolarAngle = Math.PI * 0.49;
        this.resetCamera();
      }
    }

    this.updatePlanMaterialForView();
    this.updateRoomZonesForView();
  }


  setWalkMode(enabled) {
    this.setEditorView(enabled ? 'walk' : '3d');
  }

  updatePlanMaterialForView() {
    if (!this.floorMesh?.material) return;
    const material = this.floorMesh.material;
    const hasPlan = !!material.map;
    if (!hasPlan) {
      material.transparent = true;
      material.opacity = 1;
      material.color.set(this.state.floorColor);
      material.needsUpdate = true;
      return;
    }

    material.transparent = true;
    if (this.viewMode === 'plan') {
      material.opacity = this.planOpacityPlan;
    } else if (this.viewMode === '3d') {
      material.opacity = this.planOpacity3d;
    } else {
      material.opacity = 0.08;
    }
    material.needsUpdate = true;
  }

  resetCamera() {
    const span = Math.max(this.estancia.ancho, this.estancia.largo);
    this.camera.position.set(span * 0.95, Math.max(this.state.wallHeight * 1.6, 5.6), span * 0.82);
    this.orbitControls.target.set(0, Math.min(1.1, this.state.wallHeight * 0.45), 0);
    this.orbitControls.update();
  }

  onResize() {
    const container = this.renderer.domElement.parentElement;
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 800;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onKeyDown(event) {
    this.keys[event.key.toLowerCase()] = true;
    if (event.key === 'Delete') {
      this.deleteSelection();
    }
    if (event.key.toLowerCase() === 'q') {
      this.rotateSelected(-Math.PI / 12);
    }
    if (event.key.toLowerCase() === 'e') {
      this.rotateSelected(Math.PI / 12);
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      this.setEditorView(this.viewMode === 'walk' ? '3d' : 'walk');
    }
    if (event.key === 'Escape') {
      this.pendingWallStart = null;
      this.selectEntity(null);
    }
  }

  onKeyUp(event) {
    this.keys[event.key.toLowerCase()] = false;
  }

  updatePointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  getIntersections(objects) {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(objects, true);
  }

  getFloorPoint() {
    const hits = this.getIntersections([this.floorMesh]);
    if (!hits.length) {
      return null;
    }
    return hits[0].point.clone();
  }


  onPointerDown(event) {
    this.updatePointer(event);

    if (this.currentMode === 'draw-wall') {
      const point = this.getFloorPoint();
      if (!point) return;
      point.y = 0;
      this.handleWallDrawing(point);
      return;
    }

    const wallHits = this.getIntersections(this.wallGroup.children);
    const furnitureHits = this.getIntersections(this.furnitureGroup.children);
    const firstWall = wallHits[0];
    const firstFurnitureHit = furnitureHits[0];
    const furnitureRoot = firstFurnitureHit ? this.resolveFurnitureRoot(firstFurnitureHit.object) : null;

    if (this.currentMode === 'delete-wall') {
      if (firstWall) {
        this.removeWallById(firstWall.object.userData.entityId);
      }
      return;
    }

    if (this.currentMode === 'paint-wall') {
      if (firstWall) {
        this.paintWallById(firstWall.object.userData.entityId, this.state.wallColor);
      }
      return;
    }

    if (furnitureRoot?.userData?.entityType === 'furniture') {
      const id = furnitureRoot.userData.entityId;
      this.selectEntity({ type: 'furniture', id, mesh: furnitureRoot });

      if (this.currentMode !== 'draw-wall' && this.currentMode !== 'delete-wall' && this.currentMode !== 'paint-wall') {
        this.isDraggingFurniture = true;
        this.orbitControls.enabled = false;
        const floorPoint = this.getFloorPoint();
        if (floorPoint) {
          this.dragOffset.copy(furnitureRoot.position).sub(floorPoint);
        } else {
          this.dragOffset.set(0, 0, 0);
        }
      }
      return;
    }

    if (firstWall) {
      this.selectEntity({ type: 'wall', id: firstWall.object.userData.entityId, mesh: firstWall.object });
      return;
    }

    this.selectEntity(null);
  }

  onPointerMove(event) {
    this.updatePointer(event);
    const point = this.getFloorPoint();
    if (point) {
      this.hoverPointMesh.position.copy(point);
      this.hoverPointMesh.visible = this.currentMode === 'draw-wall';
    } else {
      this.hoverPointMesh.visible = false;
    }

    const hoveringFurniture = this.getIntersections(this.furnitureGroup.children)[0];
    this.renderer.domElement.style.cursor = this.isDraggingFurniture
      ? 'grabbing'
      : hoveringFurniture ? 'grab' : (this.currentMode === 'draw-wall' ? 'crosshair' : 'default');

    if (this.isDraggingFurniture && this.selectedEntity?.type === 'furniture' && point) {
      const mesh = this.selectedEntity.mesh;
      const furniture = this.findFurnitureById(this.selectedEntity.id);
      const nextX = this.clamp(point.x + this.dragOffset.x, -this.estancia.ancho / 2 + furniture.ancho / 2, this.estancia.ancho / 2 - furniture.ancho / 2);
      const nextZ = this.clamp(point.z + this.dragOffset.z, -this.estancia.largo / 2 + furniture.profundo / 2, this.estancia.largo / 2 - furniture.profundo / 2);
      mesh.position.set(nextX, furniture.alto / 2, nextZ);
      furniture.posicion = { x: nextX, y: furniture.alto / 2, z: nextZ };
      this.updateSelectionInfo();
      this.updateSummary(false);
    }
  }

  onPointerUp() {
    this.isDraggingFurniture = false;
    if (this.viewMode !== 'walk') {
      this.orbitControls.enabled = true;
    }
  }

  handleWallDrawing(point) {
    const snapped = this.snapPoint(point);
    if (!this.pendingWallStart) {
      this.pendingWallStart = snapped;
      this.dom.estadoEditor.textContent = `Punto inicial: ${snapped.x.toFixed(2)}, ${snapped.z.toFixed(2)} · haz el segundo clic`;
      return;
    }

    const dx = snapped.x - this.pendingWallStart.x;
    const dz = snapped.z - this.pendingWallStart.z;
    if (Math.hypot(dx, dz) < 0.35) {
      this.dom.estadoEditor.textContent = 'La pared es demasiado corta. Usa una longitud mínima de 35 cm.';
      return;
    }

    const wall = this.makeWallData(this.pendingWallStart, snapped, {
      height: this.state.wallHeight,
      thickness: this.state.wallThickness,
      color: this.state.wallColor
    });
    this.walls.push(wall);
    this.rebuildWalls();
    this.pendingWallStart = null;
    this.dom.estadoEditor.textContent = 'Pared creada. Puedes seguir dibujando.';
    this.updateSummary();
  }

  snapPoint(point) {
    return {
      x: Math.round(point.x / 0.1) * 0.1,
      z: Math.round(point.z / 0.1) * 0.1
    };
  }

  resolveFurnitureRoot(object) {
    let current = object;
    while (current && current.parent && current.userData?.entityType !== 'furniture') {
      current = current.parent;
    }
    return current;
  }

  selectEntity(entity) {
    this.selectedEntity = entity;
    this.updateSelectionInfo();
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
      this.selectionBox.geometry?.dispose?.();
      this.selectionBox.material?.dispose?.();
      this.selectionBox = null;
    }
    if (!entity?.mesh) return;
    const box = new THREE.BoxHelper(entity.mesh, entity.type === 'wall' ? 0x8a3d3d : 0x55735c);
    this.selectionBox = box;
    this.scene.add(box);
  }

  updateSelectionInfo() {
    const entity = this.selectedEntity;
    if (!entity) {
      this.dom.seleccionInfo.innerHTML = '<p>No hay ningún elemento seleccionado.</p>';
      return;
    }

    if (entity.type === 'wall') {
      const wall = this.findWallById(entity.id);
      if (!wall) return;
      const length = Math.hypot(wall.end.x - wall.start.x, wall.end.z - wall.start.z);
      this.dom.seleccionInfo.innerHTML = `
        <p><strong>Pared seleccionada</strong></p>
        <p>Largo: ${length.toFixed(2)} m</p>
        <p>Alto: ${wall.height.toFixed(2)} m</p>
        <p>Grosor: ${wall.thickness.toFixed(2)} m</p>
        <p>Color: ${wall.color}</p>
      `;
      return;
    }

    const furniture = this.findFurnitureById(entity.id);
    if (!furniture) return;
    this.dom.seleccionInfo.innerHTML = `
      <p><strong>${furniture.nombre}</strong></p>
      <p>Posición: X ${furniture.posicion.x.toFixed(2)} · Z ${furniture.posicion.z.toFixed(2)}</p>
      <p>Medidas: ${furniture.ancho.toFixed(2)} × ${furniture.profundo.toFixed(2)} × ${furniture.alto.toFixed(2)} m</p>
      <p>Rotación: ${(THREE.MathUtils.radToDeg(furniture.rotacion) % 360).toFixed(0)}°</p>
    `;
  }

  findWallById(id) {
    return this.walls.find((wall) => wall.id === id);
  }

  findFurnitureById(id) {
    return this.muebles.find((item) => item.id === id);
  }

  removeWallById(id) {
    this.walls = this.walls.filter((wall) => wall.id !== id);
    if (this.selectedEntity?.type === 'wall' && this.selectedEntity.id === id) {
      this.selectEntity(null);
    }
    this.rebuildWalls();
  }

  paintWallById(id, color) {
    const wall = this.findWallById(id);
    if (!wall) return;
    wall.color = color;
    this.rebuildWalls();
    const mesh = this.wallGroup.children.find((child) => child.userData.entityId === id);
    this.selectEntity(mesh ? { type: 'wall', id, mesh } : null);
  }

  applyWallColor() {
    if (this.selectedEntity?.type === 'wall') {
      this.paintWallById(this.selectedEntity.id, this.dom.wallColor.value);
      return;
    }
    this.state.wallColor = this.dom.wallColor.value;
    this.walls.forEach((wall) => {
      wall.color = this.state.wallColor;
    });
    this.rebuildWalls();
  }

  applyFloorColor() {
    this.state.floorColor = this.dom.floorColor.value;
    this.floorMesh.material.color.set(this.state.floorColor);
    this.updatePlanMaterialForView();
    this.floorMesh.material.needsUpdate = true;
  }

  rotateSelected(delta) {
    if (this.selectedEntity?.type !== 'furniture') return;
    const item = this.findFurnitureById(this.selectedEntity.id);
    if (!item || !this.selectedEntity.mesh) return;
    item.rotacion += delta;
    this.selectedEntity.mesh.rotation.y = item.rotacion;
    this.updateSelectionInfo();
    this.updateSummary(false);
  }

  duplicateSelectedFurniture() {
    if (this.selectedEntity?.type !== 'furniture') return;
    const current = this.findFurnitureById(this.selectedEntity.id);
    if (!current) return;
    const catalogItem = this.catalogo.find((item) => item.id === current.catalogId);
    if (!catalogItem) return;
    this.addFurniture(catalogItem, {
      ...current,
      id: this.uid('furniture'),
      posicion: {
        x: this.clamp(current.posicion.x + 0.45, -this.estancia.ancho / 2 + current.ancho / 2, this.estancia.ancho / 2 - current.ancho / 2),
        y: current.posicion.y,
        z: this.clamp(current.posicion.z + 0.45, -this.estancia.largo / 2 + current.profundo / 2, this.estancia.largo / 2 - current.profundo / 2)
      }
    });
  }

  deleteSelection() {
    if (!this.selectedEntity) return;
    if (this.selectedEntity.type === 'wall') {
      this.removeWallById(this.selectedEntity.id);
      this.selectEntity(null);
      return;
    }
    this.muebles = this.muebles.filter((item) => item.id !== this.selectedEntity.id);
    const mesh = this.furnitureGroup.children.find((child) => child.userData.entityId === this.selectedEntity.id);
    if (mesh) {
      this.furnitureGroup.remove(mesh);
    }
    this.selectEntity(null);
    this.updateSummary();
  }

  clearFurniture(showConfirm = true) {
    if (showConfirm && !window.confirm('Se eliminarán todos los muebles del diseño actual.')) return;
    while (this.furnitureGroup.children.length) {
      this.furnitureGroup.remove(this.furnitureGroup.children[0]);
    }
    this.muebles = [];
    this.selectEntity(null);
    this.updateSummary();
  }

  confirmRebuildPerimeter() {
    if (this.walls.length && !window.confirm('Se sustituirán las paredes actuales por el perímetro básico de la estancia.')) {
      return;
    }
    this.createPerimeterWalls();
    this.selectEntity(null);
  }

  async handlePlanUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.type === 'application/pdf') {
        const dataUrl = await this.renderPdfPageToImage(file);
        this.applyPlanTexture(dataUrl);
      } else if (file.type.startsWith('image/')) {
        const dataUrl = await this.readFileAsDataURL(file);
        this.applyPlanTexture(dataUrl);
      } else {
        alert('Solo se admiten imágenes o PDF.');
      }
    } catch (error) {
      console.error(error);
      alert('No se pudo procesar el plano.');
    } finally {
      event.target.value = '';
    }
  }

  async readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async renderPdfPageToImage(file) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = window['pdfjsLib'].getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/png');
  }

  applyPlanTexture(dataUrl) {
    this.state.planImage = dataUrl;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(dataUrl, (texture) => {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.center.set(0.5, 0.5);
      texture.rotation = Math.PI / 2;
      texture.needsUpdate = true;

      const material = this.floorMesh.material;
      material.map = texture;
      material.color.set(0xffffff);
      material.transparent = true;
      material.needsUpdate = true;
      this.updatePlanMaterialForView();

      this.dom.planPreview.innerHTML = `<img src="${dataUrl}" alt="Plano subido">`;
      this.dom.estadoEditor.textContent = 'Plano cargado. Usa Plano 2D para marcar muros y Vista 3D para enseñarlo con volumen.';
      this.setEditorView('plan');
    });
  }

  clearPlanTexture() {
    this.state.planImage = null;
    if (this.floorMesh.material.map) {
      this.floorMesh.material.map.dispose?.();
      this.floorMesh.material.map = null;
      this.floorMesh.material.color.set(this.state.floorColor);
      this.floorMesh.material.opacity = 1;
      this.floorMesh.material.needsUpdate = true;
    }
    this.dom.planPreview.innerHTML = '<p>Sin plano cargado</p>';
  }


  autoStageRoom() {
    const roomName = (this.estancia.nombre || '').toLowerCase();
    const addById = (id, overrides = {}) => {
      const item = this.catalogo.find((entry) => entry.id === id);
      if (!item) return null;
      return this.addFurniture(item, {
        ...overrides,
        id: this.uid('furniture'),
        catalogId: item.id
      });
    };

    this.clearFurniture(false);

    if (roomName.includes('cocina')) {
      addById('cocina-1', { posicion: { x: -1.6, y: 0.46, z: -1.7 }, rotacion: 0 });
      addById('cocina-1', { posicion: { x: 0.2, y: 0.46, z: -1.7 }, rotacion: 0 });
      addById('mesa-2', { posicion: { x: 0.8, y: 0.375, z: 0.6 }, rotacion: Math.PI / 2 });
      addById('silla-1', { posicion: { x: 0.2, y: 0.45, z: 1.2 }, rotacion: 0 });
      addById('silla-1', { posicion: { x: 1.4, y: 0.45, z: 1.2 }, rotacion: Math.PI });
    } else if (roomName.includes('baño') || roomName.includes('bano')) {
      addById('bano-1', { posicion: { x: -0.8, y: 0.425, z: -1.2 }, rotacion: 0 });
      addById('bano-2', { posicion: { x: 0.8, y: 0.4, z: -0.8 }, rotacion: 0 });
      addById('decor-2', { posicion: { x: -1.2, y: 0.55, z: 1.2 }, rotacion: 0 });
    } else {
      addById('sofa-1', { posicion: { x: 0, y: 0.41, z: 0.7 }, rotacion: 0 });
      addById('mesa-1', { posicion: { x: 0, y: 0.21, z: -0.25 }, rotacion: 0 });
      addById('silla-1', { posicion: { x: -1.1, y: 0.45, z: -1.0 }, rotacion: Math.PI / 4 });
      if (roomName.includes('sal') || roomName.includes('estar') || roomName.includes('living')) {
        addById('decor-2', { posicion: { x: 1.7, y: 0.55, z: -1.5 }, rotacion: 0 });
        addById('decor-1', { posicion: { x: -1.9, y: 0.85, z: 1.4 }, rotacion: 0 });
      }
      if (roomName.includes('dorm') || roomName.includes('habit')) {
        addById('sofa-2', { posicion: { x: 0, y: 0.41, z: 0.3 }, rotacion: Math.PI / 2 });
      }
    }

    this.setMode('move');
    this.setEditorView('3d');
    this.dom.estadoEditor.textContent = 'Demo preparada. Ahora puedes arrastrar muebles y enseñar la vista 3D.';
    this.updateSummary();
  }

  collectDesignState() {
    return {
      version: 2,
      estancia: this.estancia,
      state: this.state,
      walls: this.walls,
      muebles: this.muebles
    };
  }

  async saveDesign() {
    const payload = {
      id_estancia: this.estanciaId,
      nombre: `${this.estancia.nombre} · ${new Date().toLocaleString('es-ES')}`,
      config_json: this.collectDesignState()
    };

    const localKey = this.getLocalStorageKey();
    localStorage.setItem(localKey, JSON.stringify(payload.config_json));

    if (!this.estanciaId) {
      this.updateSummary();
      alert('Diseño guardado localmente en este navegador.');
      return;
    }

    try {
      const url = this.disenoId ? `/api/diseno3d/${this.disenoId}` : '/api/diseno3d';
      const method = this.disenoId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.disenoId ? { nombre: payload.nombre, config_json: payload.config_json } : payload)
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      this.disenoId = result.id || result.diseno?.id_diseno || this.disenoId;
      this.updateSummary();
      alert('Diseño guardado correctamente.');
    } catch (error) {
      console.warn('Fallo guardando en backend, el diseño queda guardado en localStorage.', error);
      alert('Diseño guardado en localStorage. Revisa la ruta /api/diseno3d en tu servidor.');
    }
  }

  async tryLoadExistingDesign() {
    let config = null;
    const localRaw = localStorage.getItem(this.getLocalStorageKey());
    if (localRaw) {
      try {
        config = JSON.parse(localRaw);
      } catch (error) {
        console.warn('No se pudo parsear el diseño local', error);
      }
    }

    if (!config && this.disenoId) {
      try {
        const response = await fetch(`/api/diseno3d/${this.disenoId}`);
        if (response.ok) {
          const result = await response.json();
          config = result?.diseno?.config_json || null;
        }
      } catch (error) {
        console.warn('No se pudo cargar el diseño remoto', error);
      }
    }

    if (!config) {
      this.resetCamera();
      this.setMode('select');
      this.setWalkMode(false);
      return;
    }

    this.loadDesignState(config);
    this.resetCamera();
    this.setMode('select');
    this.setWalkMode(false);
  }

  loadDesignState(config) {
    if (config.estancia) {
      this.estancia = {
        nombre: config.estancia.nombre || this.estancia.nombre,
        ancho: Number(config.estancia.ancho) || this.estancia.ancho,
        largo: Number(config.estancia.largo) || this.estancia.largo,
        alto: Number(config.estancia.alto) || this.estancia.alto
      };
      this.refreshRoomMeshes();
      this.updateEstanciaUI();
    }

    if (config.state) {
      this.state = {
        ...this.state,
        ...config.state
      };
      this.syncInputsFromState();
    this.setMode('move');
      this.ceilingMesh.position.y = this.state.wallHeight;
      this.applyFloorColor();
    }

    if (config.state?.planImage) {
      this.applyPlanTexture(config.state.planImage);
    }

    if (Array.isArray(config.walls) && config.walls.length) {
      this.walls = config.walls.map((wall) => this.makeWallData(wall.start, wall.end, wall));
      this.rebuildWalls();
    }

    if (Array.isArray(config.muebles)) {
      this.muebles = [];
      while (this.furnitureGroup.children.length) {
        this.furnitureGroup.remove(this.furnitureGroup.children[0]);
      }
      config.muebles.forEach((saved) => {
        const catalogItem = this.catalogo.find((item) => item.id === saved.catalogId) || saved;
        this.addFurniture(catalogItem, saved);
      });
      this.selectEntity(null);
    }
    this.updateSummary();
  }

  getLocalStorageKey() {
    return `mim-living-3d-${this.estanciaId || 'local'}-${this.disenoId || 'draft'}`;
  }

  updateSummary(updateTimestamp = true) {
    this.dom.totalMuebles.textContent = String(this.muebles.length);
    this.dom.totalParedes.textContent = String(this.walls.length);
    if (updateTimestamp) {
      this.dom.ultimaActualizacion.textContent = new Date().toLocaleTimeString('es-ES');
    }
    this.updateSelectionInfo();
  }

  updateWalkCamera(delta) {
    if (!this.walkEnabled) return;
    const speed = 2.4;
    const direction = new THREE.Vector3();
    if (this.keys['w']) direction.z -= 1;
    if (this.keys['s']) direction.z += 1;
    if (this.keys['a']) direction.x -= 1;
    if (this.keys['d']) direction.x += 1;
    if (direction.lengthSq() === 0) return;
    direction.normalize();

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize().negate();
    const move = new THREE.Vector3();
    move.addScaledVector(forward, direction.z);
    move.addScaledVector(right, direction.x);
    move.normalize().multiplyScalar(speed * delta);

    this.camera.position.x = this.clamp(this.camera.position.x + move.x, -this.estancia.ancho / 2 + 0.4, this.estancia.ancho / 2 - 0.4);
    this.camera.position.z = this.clamp(this.camera.position.z + move.z, -this.estancia.largo / 2 + 0.4, this.estancia.largo / 2 - 0.4);
    this.camera.position.y = 1.65;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();
    if (!this.walkEnabled) {
      this.orbitControls.update();
    } else {
      this.updateWalkCamera(delta);
    }
    if (this.selectionBox && this.selectedEntity?.mesh) {
      this.selectionBox.update();
    }
    this.renderer.render(this.scene, this.camera);
  }

  hideLoading() {
    this.dom.loadingViewport.style.display = 'none';
  }

  uid(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app3D = new Plano3DApp();
});
