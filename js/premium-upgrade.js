(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initProgress() {
    const fill = document.getElementById('sectionProgress');
    if (!fill) return;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      fill.style.width = Math.min(100, Math.max(0, pct)).toFixed(2) + '%';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  function initStoryReveal() {
    const items = document.querySelectorAll('.story-step');
    if (!items.length) return;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    items.forEach((el) => io.observe(el));
  }

  function initParallax() {
    const nodes = document.querySelectorAll('[data-parallax]');
    if (!nodes.length || prefersReduced) return;
    const onScroll = () => {
      const y = window.scrollY;
      nodes.forEach((el) => {
        const speed = Number(el.getAttribute('data-parallax') || 0.08);
        el.style.transform = `translateY(${(y * speed).toFixed(1)}px)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initLazyHints() {
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });
  }

  function initHero3D() {
    const shell = document.getElementById('hero3dShell');
    const canvas = document.getElementById('hero-3d-canvas');
    if (!shell || !canvas) return;

    const enable3D = !!window.THREE && !prefersReduced && window.innerWidth > 900;
    if (!enable3D) {
      shell.classList.add('three-disabled');
      return;
    }

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.2, 3.3);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));

    const geo = new THREE.TorusKnotGeometry(0.95, 0.28, 180, 24);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x4a8dff,
      metalness: 0.45,
      roughness: 0.25,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      emissive: 0x102840,
      emissiveIntensity: 0.25
    });
    const knot = new THREE.Mesh(geo, mat);
    scene.add(knot);

    const pLight = new THREE.PointLight(0x1f6aff, 2.1, 20);
    pLight.position.set(2.4, 1.3, 3.4);
    scene.add(pLight);

    const oLight = new THREE.PointLight(0xff9a1f, 1.8, 20);
    oLight.position.set(-2.5, -1.4, 2.1);
    scene.add(oLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX = x * 0.22;
      mouseY = y * 0.2;
    }, { passive: true });

    function resize() {
      const w = shell.clientWidth;
      const h = shell.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }

    function animate() {
      knot.rotation.x += 0.004;
      knot.rotation.y += 0.006;
      knot.rotation.x += (mouseY - knot.rotation.x) * 0.02;
      knot.rotation.y += (mouseX - knot.rotation.y) * 0.02;
      const scrollInfluence = Math.min(0.6, window.scrollY / 1800);
      knot.rotation.z = scrollInfluence;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);
    animate();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initProgress();
    initStoryReveal();
    initParallax();
    initLazyHints();
    initHero3D();
  });
})();
