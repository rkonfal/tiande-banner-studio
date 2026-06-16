import { brandAssets, productFeed, bundleFeed } from './feed.js';
import { realProductFeed, realBundleFeed } from './real-feed.js';
import { catalog, templates } from './products.js';

const formats = [
  { key: 'wide', label: '16:9' },
  { key: 'feed', label: '4:5' },
  { key: 'square', label: '1:1' },
  { key: 'story', label: '9:16' },
];

const headlineVariants = [
  'Objevte sílu každodenní péče',
  'Malý rituál, viditelný rozdíl',
  'Péče, kterou si pleť zamiluje',
  'Top volba pro každodenní výsledky',
  'Rychlá cesta k lepšímu dojmu z pleti',
  'Jemná péče s efektem, který je vidět',
  'Vyber si péči, která funguje i v běžném dni',
  'Váš nový favorit pro krásnější vzhled',
];

const ctaVariants = ['Nakoupit teď', 'Zjistit více', 'Chci vyzkoušet', 'Prohlédnout produkt'];
const subheadlineVariants = [
  'Navržené pro e-shop, feed i stories',
  'Více variant textu i layoutu pro rychlé schválení',
  'Vizuál připravený pro více formátů bez další ruční práce',
  'Jedna myšlenka, čtyři formáty, rychlé rozhodnutí',
];

const grid = document.querySelector('#variants-grid');
const form = document.querySelector('#generator-form');
const template = document.querySelector('#variant-template');
const statVariants = document.querySelector('#stat-variants');
const statApproved = document.querySelector('#stat-approved');
const toolbarSummary = document.querySelector('#toolbar-summary');
const approveAllBtn = document.querySelector('#approve-all');
const exportSelectedBtn = document.querySelector('#export-selected');
const downloadAllBtn = document.querySelector('#download-all');
const downloadZipBtn = document.querySelector('#download-zip');
const downloadManifestBtn = document.querySelector('#download-manifest');
const exportSummary = document.querySelector('#export-summary');
const exportLinks = document.querySelector('#export-links');
const inputTypeSelect = document.querySelector('#input-type-select');
const catalogSelect = document.querySelector('#catalog-select');
const feedName = document.querySelector('#feed-name');
const feedMeta = document.querySelector('#feed-meta');
const feedAssets = document.querySelector('#feed-assets');
const feedPrice = document.querySelector('#feed-price');
const projectNameInput = document.querySelector('#project-name');
const projectSummary = document.querySelector('#project-summary');
const projectList = document.querySelector('#project-list');
const saveProjectBtn = document.querySelector('#save-project');
const loadProjectBtn = document.querySelector('#load-project');
const exportProjectBtn = document.querySelector('#export-project');
const importProjectInput = document.querySelector('#import-project');
const editorPanel = document.querySelector('#variant-editor');
const editorTitle = document.querySelector('#editor-title');
const editorHeadline = document.querySelector('#editor-headline');
const editorSubheadline = document.querySelector('#editor-subheadline');
const editorCta = document.querySelector('#editor-cta');
const editorBadge = document.querySelector('#editor-badge');
const editorBenefits = document.querySelector('#editor-benefits');
const editorImageMode = document.querySelector('#editor-image-mode');
const assetSlotsWrap = document.querySelector('#asset-slots');
const saveEditorBtn = document.querySelector('#save-editor');
const closeEditorBtn = document.querySelector('#close-editor');

const PROJECT_STORAGE_KEY = 'banner-studio:last-project';
const PROJECTS_STORAGE_KEY = 'banner-studio:projects';

let variants = [];
let exportManifest = [];
let exportFiles = [];
let activeEditorVariantId = null;
let customAssetDraft = {};

function shufflePick(items, index) {
  return items[index % items.length];
}

function splitBenefits(raw) {
  return String(raw || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function sanitizeFileName(value) {
  return String(value || 'banner-set')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'banner-set';
}

function formatSavedAt(iso) {
  if (!iso) return 'bez času';
  const date = new Date(iso);
  return date.toLocaleString('cs-CZ');
}

function getStoredProjects() {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setStoredProjects(projects) {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

function renderProjectList() {
  const projects = getStoredProjects();
  projectList.innerHTML = '';
  if (!projects.length) {
    projectList.innerHTML = '<div class="project-item"><div><strong>Zatím nic uloženého</strong><small>Po prvním uložení se tady objeví projekty.</small></div></div>';
    return;
  }

  projects.forEach((project) => {
    const row = document.createElement('div');
    row.className = 'project-item';
    row.innerHTML = `
      <div>
        <strong>${project.projectName}</strong>
        <small>${project.variants?.length || 0} variant · ${formatSavedAt(project.savedAt)}</small>
      </div>
      <button type="button" class="secondary-btn" data-action="load">Načíst</button>
      <button type="button" class="secondary-btn" data-action="delete">Smazat</button>
    `;
    row.querySelector('[data-action="load"]').addEventListener('click', () => {
      applyProject(project);
    });
    row.querySelector('[data-action="delete"]').addEventListener('click', () => {
      const filtered = getStoredProjects().filter((item) => item.id !== project.id);
      setStoredProjects(filtered);
      renderProjectList();
      projectSummary.textContent = `Projekt „${project.projectName}“ jsem smazal z lokálního seznamu.`;
    });
    projectList.appendChild(row);
  });
}

function getCatalogItems(type) {
  return type === 'bundle'
    ? [...realBundleFeed, ...catalog.bundles]
    : [...realProductFeed, ...catalog.products];
}

function getFeedItems(type) {
  return type === 'bundle'
    ? [...realBundleFeed, ...bundleFeed]
    : [...realProductFeed, ...productFeed];
}

function populateCatalogSelect(type) {
  const items = getCatalogItems(type);
  catalogSelect.innerHTML = items
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join('');
}

function getCatalogEntry(type, id) {
  return getCatalogItems(type).find((item) => item.id === id) || getCatalogItems(type)[0];
}

function getFeedEntry(type, id) {
  return getFeedItems(type).find((item) => item.id === id) || getFeedItems(type)[0];
}

function hydrateFormFromCatalog(item, styleHint) {
  if (!item) return;
  form.elements.productName.value = item.name || '';
  form.elements.headline.value = item.headline || item.name || '';
  form.elements.benefits.value = (item.benefits || []).join('\n');
  form.elements.cta.value = item.cta || 'Nakoupit teď';
  if (styleHint) form.elements.styleFamily.value = styleHint;
}

function updateFeedStrip(type, id) {
  const item = getFeedEntry(type, id);
  if (!item) return;
  const assetCount = (item.gallery?.length || 0) + (type === 'bundle' ? (item.itemIds?.length || 0) : 1);
  feedName.textContent = item.name;
  feedMeta.textContent = `${item.availability} · ${item.category || 'sestava'} · ${item.sku || 'bundle'}${item.url ? ' · live WPJ' : ''}`;
  feedAssets.textContent = String(assetCount);
  feedPrice.textContent = `${item.price} ${item.currency}`;
}

function createCopyVariant(baseHeadline, maxWords, index) {
  const source = index === 0 ? baseHeadline : shufflePick(headlineVariants, index - 1);
  return source.split(' ').slice(0, maxWords).join(' ');
}

function buildAssetSlots(feedItem, assetMode, inputType) {
  const autoMode = assetMode === 'auto';
  const resolvedMode = autoMode ? (inputType === 'bundle' ? 'bundle-stack' : 'single-packshot') : assetMode;
  const gallery = feedItem.gallery || [];
  const bundleExtras = inputType === 'bundle' ? (feedItem.itemIds || []).map((id) => `Item ${id}`) : [];
  const slotCount = resolvedMode === 'bundle-stack' ? 4 : 3;
  return {
    mode: resolvedMode,
    slots: [feedItem.name, ...gallery.slice(0, 2), ...bundleExtras].slice(0, slotCount),
  };
}

function generateVariants(payload) {
  const item = getCatalogEntry(payload.inputType, payload.catalogId);
  const feedItem = getFeedEntry(payload.inputType, payload.catalogId);
  const style = templates[payload.styleFamily] || templates.clean;
  const benefits = splitBenefits(payload.benefits);
  const count = Math.max(5, Math.min(10, Number(payload.variantCount || 5)));
  const assets = buildAssetSlots(feedItem, payload.assetMode, payload.inputType);

  return Array.from({ length: count }, (_, index) => {
    const focus = benefits.slice(0, Math.max(2, Math.min(style.copyRules.bulletCount, (index % 4) + 2)));
    const background = shufflePick(style.backgrounds, index);
    return {
      id: `variant-${Date.now()}-${index + 1}-${Math.random().toString(36).slice(2, 6)}`,
      status: 'draft',
      title: `${payload.productName} / varianta ${index + 1}`,
      headline: createCopyVariant(payload.headline, style.copyRules.maxHeadlineWords, index),
      subheadline: shufflePick(subheadlineVariants, index),
      cta: index === 0 ? payload.cta : shufflePick(ctaVariants, index),
      styleFamily: payload.styleFamily,
      productName: payload.productName,
      benefits: focus,
      badge: item.badge,
      templateLabel: style.label,
      background,
      mood: style.mood,
      sourceType: payload.inputType,
      assetMode: assets.mode,
      assetSlots: assets.slots,
      price: `${feedItem.price} ${feedItem.currency}`,
      availability: feedItem.availability,
      logoText: brandAssets.logoText,
      layout: style.layout,
      packshotShape: feedItem.packshotShape || 'jar',
      packshotPalette: feedItem.colors || ['#f4dcc7', '#fff8f3', '#d7b297'],
      imagePath: feedItem.imagePath || '',
      altImagePaths: [...(feedItem.altImagePaths || [])],
      imagePaths: [...(feedItem.imagePaths || [])],
      imageMode: payload.imageMode || 'auto',
    };
  });
}

function getVariantImageList(variant) {
  if (variant.sourceType === 'bundle') {
    const mainImages = (variant.imagePaths || []).filter(Boolean);
    const altImages = (variant.altImagePaths || []).filter(Boolean);
    if (variant.imageMode === 'lifestyle') return (altImages.length ? altImages : mainImages).slice(0, 2);
    if (variant.imageMode === 'packshot') return mainImages.slice(0, 2);
    return mainImages.slice(0, 2);
  }
  const mainImage = variant.imagePath || '';
  const altImage = (variant.altImagePaths || []).find(Boolean) || '';
  if (variant.imageMode === 'lifestyle') return [altImage || mainImage].filter(Boolean);
  if (variant.imageMode === 'packshot') return [mainImage].filter(Boolean);
  return [mainImage].filter(Boolean);
}

function setVariantImageAt(variant, index, value, mode = 'packshot') {
  if (variant.sourceType === 'bundle') {
    if (mode === 'lifestyle') {
      const current = [...(variant.altImagePaths || [])];
      current[index] = value;
      variant.altImagePaths = current;
    } else {
      const current = [...(variant.imagePaths || [])];
      current[index] = value;
      variant.imagePaths = current;
    }
  } else if (mode === 'lifestyle') {
    const current = [...(variant.altImagePaths || [])];
    current[index] = value;
    variant.altImagePaths = current;
  } else {
    variant.imagePath = value;
  }
}

function formatModeLabel(styleFamily) {
  return templates[styleFamily]?.label || 'Default';
}

function createAssetPreview(shape) {
  const el = document.createElement('div');
  el.className = 'preview-packshot';
  if (shape === 'bottle') {
    el.style.borderRadius = '16px 16px 12px 12px';
    el.style.height = '58px';
  } else if (shape === 'tube') {
    el.style.borderRadius = '10px 10px 14px 14px';
    el.style.transform = 'skew(-6deg)';
  } else if (shape === 'bundle') {
    el.style.width = '44px';
    el.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.62))';
    el.style.boxShadow = '8px 10px 16px rgba(61,35,19,0.06), -8px 10px 16px rgba(61,35,19,0.06)';
  }
  return el;
}

function renderPreviewFormat(variant, format) {
  const preview = document.createElement('div');
  preview.className = `format-preview ${format.key} ${variant.styleFamily === 'arrows' ? 'arrows' : ''}`;
  preview.style.background = variant.background;
  const imageList = getVariantImageList(variant);
  const packshots = imageList.length
    ? imageList.map((src) => `<img class="preview-packshot preview-packshot-image" src="${src}" alt="packshot" />`).join('')
    : variant.assetSlots.slice(0, variant.sourceType === 'bundle' ? 2 : 1).map(() => '<span class="preview-packshot"></span>').join('');

  preview.innerHTML = `
    <div class="preview-overlay">
      <span class="preview-tag">${format.label}</span>
      <div class="preview-content">
        <h4>${variant.headline}</h4>
        <p>${variant.subheadline}</p>
        <div class="preview-product-stack">${packshots}</div>
        <div class="preview-bullets">
          ${variant.benefits.map((item) => `<span>${item}</span>`).join('')}
        </div>
        <div class="template-chip">${variant.templateLabel} · ${variant.badge} · ${variant.price}</div>
      </div>
      <div class="preview-footer">
        <span class="logo-chip">${variant.logoText}</span>
        <span class="cta-chip">${variant.cta}</span>
      </div>
    </div>
  `;

  const stack = preview.querySelector('.preview-product-stack');
  if (!imageList.length) {
    stack.innerHTML = '';
    variant.assetSlots.slice(0, variant.sourceType === 'bundle' ? 2 : 1).forEach(() => {
      stack.appendChild(createAssetPreview(variant.packshotShape));
    });
  }
  return preview;
}

function renderAssetManager(variant) {
  assetSlotsWrap.innerHTML = '';
  const slotCount = variant.sourceType === 'bundle' ? 2 : 1;

  for (let i = 0; i < slotCount; i += 1) {
    const isLifestyle = variant.imageMode === 'lifestyle';
    const currentValue = isLifestyle
      ? ((variant.altImagePaths || [])[i] || '')
      : (variant.sourceType === 'bundle' ? ((variant.imagePaths || [])[i] || '') : (variant.imagePath || ''));
    const draftKey = `${variant.id}:${variant.imageMode}:${i}`;
    const row = document.createElement('div');
    row.className = 'asset-slot';
    row.innerHTML = `
      <img class="asset-thumb" src="${currentValue || ''}" alt="asset preview" />
      <div class="asset-slot-fields">
        <strong>${isLifestyle ? 'Lifestyle' : 'Packshot'} ${i + 1}</strong>
        <label>
          URL obrázku
          <input type="text" value="${currentValue}" data-role="asset-url" />
        </label>
        <div class="asset-slot-actions">
          <button type="button" class="secondary-btn" data-action="use-url">Použít URL</button>
          <label class="secondary-btn">
            Nahrát obrázek
            <input type="file" accept="image/*" data-role="asset-upload" />
          </label>
          <button type="button" class="secondary-btn" data-action="reset">Vrátit feed</button>
        </div>
      </div>
    `;

    const thumb = row.querySelector('[data-role="asset-thumb"], .asset-thumb');
    const urlInput = row.querySelector('[data-role="asset-url"]');
    const uploadInput = row.querySelector('[data-role="asset-upload"]');

    urlInput.addEventListener('input', () => {
      customAssetDraft[draftKey] = urlInput.value.trim();
      thumb.src = customAssetDraft[draftKey] || currentValue || '';
    });

    row.querySelector('[data-action="use-url"]').addEventListener('click', () => {
      setVariantImageAt(variant, i, urlInput.value.trim(), isLifestyle ? 'lifestyle' : 'packshot');
      renderAssetManager(variant);
      rerender();
    });

    uploadInput.addEventListener('change', async () => {
      const file = uploadInput.files?.[0];
      if (!file) return;
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setVariantImageAt(variant, i, dataUrl, isLifestyle ? 'lifestyle' : 'packshot');
      renderAssetManager(variant);
      rerender();
    });

    row.querySelector('[data-action="reset"]').addEventListener('click', () => {
      const feedEntry = getFeedEntry(variant.sourceType, form.elements.catalogId.value);
      const resetValue = isLifestyle
        ? ((feedEntry.altImagePaths || [])[i] || '')
        : (variant.sourceType === 'bundle' ? ((feedEntry.imagePaths || [])[i] || '') : (feedEntry.imagePath || ''));
      setVariantImageAt(variant, i, resetValue, isLifestyle ? 'lifestyle' : 'packshot');
      urlInput.value = resetValue;
      delete customAssetDraft[draftKey];
      renderAssetManager(variant);
      rerender();
    });

    assetSlotsWrap.appendChild(row);
  }
}

function openEditor(variant) {
  activeEditorVariantId = variant.id;
  editorTitle.textContent = variant.title;
  editorHeadline.value = variant.headline || '';
  editorSubheadline.value = variant.subheadline || '';
  editorCta.value = variant.cta || '';
  editorBadge.value = variant.badge || '';
  editorBenefits.value = (variant.benefits || []).join('\n');
  editorImageMode.value = variant.imageMode || 'auto';
  renderAssetManager(variant);
  editorPanel.classList.remove('hidden');
  editorPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeEditor() {
  activeEditorVariantId = null;
  customAssetDraft = {};
  assetSlotsWrap.innerHTML = '';
  editorPanel.classList.add('hidden');
}

function updateStats() {
  const approved = variants.filter((item) => item.status === 'approved').length;
  statVariants.textContent = String(variants.length);
  statApproved.textContent = String(approved);
  toolbarSummary.textContent = variants.length
    ? `${variants.length} variant, styl ${formatModeLabel(variants[0].styleFamily)}, preview ve 4 formátech.`
    : 'Zatím nic nevygenerováno.';
  exportSummary.textContent = approved
    ? `Připraveno ${approved} schválených variant pro export.`
    : 'Schval varianty a pak je exportuj jako skutečné PNG soubory.';
}

function rerender() {
  grid.innerHTML = '';
  variants.forEach((variant, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = variant.id;
    node.querySelector('.variant-index').textContent = `Varianta ${index + 1}`;
    node.querySelector('.variant-title').textContent = variant.title;
    node.querySelector('.variant-copy').innerHTML = `
      <strong>${variant.headline}</strong><br />
      ${variant.subheadline}<br />
      ${variant.benefits.join(' • ')}<br />
      <span class="template-chip">Template: ${variant.templateLabel} · layout: ${variant.layout} · asset mode: ${variant.assetMode}</span>
    `;

    const assetsWrap = node.querySelector('.variant-assets');
    const assetPreviewGrid = document.createElement('div');
    assetPreviewGrid.className = 'asset-preview-grid';
    variant.assetSlots.slice(0, 3).forEach((asset) => {
      const box = document.createElement('div');
      box.className = 'asset-preview';
      box.textContent = asset;
      assetPreviewGrid.appendChild(box);
    });
    assetsWrap.appendChild(assetPreviewGrid);
    variant.assetSlots.forEach((asset) => {
      const chip = document.createElement('span');
      chip.className = 'asset-chip';
      chip.textContent = asset;
      assetsWrap.appendChild(chip);
    });

    const statusPill = node.querySelector('.status-pill');
    statusPill.textContent = variant.status === 'approved' ? 'Approved' : 'Draft';
    statusPill.classList.toggle('approved', variant.status === 'approved');

    const formatGrid = node.querySelector('.format-grid');
    formats.forEach((format) => formatGrid.appendChild(renderPreviewFormat(variant, format)));

    const approveBtn = node.querySelector('.approve-btn');
    approveBtn.textContent = variant.status === 'approved' ? 'Vrátit do draftu' : 'Schválit';
    approveBtn.addEventListener('click', () => {
      variant.status = variant.status === 'approved' ? 'draft' : 'approved';
      rerender();
    });

    node.querySelector('.regenerate-btn').addEventListener('click', () => {
      variant.headline = shufflePick(headlineVariants, index + Math.floor(Math.random() * 6));
      variant.subheadline = shufflePick(subheadlineVariants, index + Math.floor(Math.random() * 4));
      variant.cta = shufflePick(ctaVariants, index + Math.floor(Math.random() * 4));
      variant.background = shufflePick(templates[variant.styleFamily].backgrounds, index + Math.floor(Math.random() * 2));
      rerender();
    });

    node.querySelector('.edit-btn').addEventListener('click', () => openEditor(variant));

    node.querySelector('.duplicate-btn').addEventListener('click', () => {
      const clone = {
        ...variant,
        benefits: [...variant.benefits],
        assetSlots: [...variant.assetSlots],
        imagePaths: [...(variant.imagePaths || [])],
        id: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `${variant.productName} / varianta copy`,
        status: 'draft',
      };
      variants.splice(index + 1, 0, clone);
      rerender();
    });

    grid.appendChild(node);
  });
  updateStats();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text || '').split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) current = test;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function getFormatSize(key) {
  return {
    wide: { width: 1600, height: 900 },
    feed: { width: 1080, height: 1350 },
    square: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
  }[key];
}

function createGradient(ctx, width, height, colors) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors[0] || '#f4dcc7');
  gradient.addColorStop(0.55, colors[1] || '#fff8f3');
  gradient.addColorStop(1, colors[2] || '#d7b297');
  return gradient;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function removeWhiteBackground(ctx, x, y, width, height) {
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const spread = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (brightness > 242 && spread < 18) {
      data[i + 3] = 0;
    } else if (brightness > 232 && spread < 24) {
      data[i + 3] = Math.max(0, data[i + 3] - 180);
    }
  }
  ctx.putImageData(imageData, x, y);
}

function drawPackshot(ctx, shape, x, y, width, height, palette, label) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  if (shape === 'bottle') {
    drawRoundedRect(ctx, x + width * 0.18, y, width * 0.32, height * 0.18, 12);
    ctx.fill();
    drawRoundedRect(ctx, x, y + height * 0.12, width * 0.68, height * 0.88, 28);
    ctx.fill();
  } else if (shape === 'tube') {
    ctx.translate(x + width * 0.5, y + height * 0.5);
    ctx.rotate(-0.08);
    drawRoundedRect(ctx, -width * 0.24, -height * 0.42, width * 0.48, height * 0.84, 24);
    ctx.fill();
    ctx.restore();
    ctx.save();
  } else if (shape === 'bundle') {
    drawRoundedRect(ctx, x - width * 0.1, y + height * 0.08, width * 0.54, height * 0.78, 22);
    ctx.fill();
    drawRoundedRect(ctx, x + width * 0.22, y, width * 0.54, height * 0.86, 22);
    ctx.fill();
  } else {
    drawRoundedRect(ctx, x, y + height * 0.18, width * 0.68, height * 0.72, 26);
    ctx.fill();
  }

  ctx.fillStyle = palette[0] || '#f4dcc7';
  drawRoundedRect(ctx, x + width * 0.06, y + height * 0.32, width * 0.56, height * 0.22, 14);
  ctx.fill();
  ctx.fillStyle = '#5b473a';
  ctx.font = `${Math.round(width * 0.08)}px Inter, Arial`;
  ctx.fillText(String(label || '').slice(0, 10), x + width * 0.11, y + height * 0.46);
  ctx.restore();
}

async function renderVariantPng(variant, format) {
  const { width, height } = getFormatSize(format.key);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = createGradient(ctx, width, height, variant.packshotPalette);
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.34)';
  drawRoundedRect(ctx, width * 0.045, height * 0.06, width * 0.91, height * 0.88, Math.min(width, height) * 0.04);
  ctx.fill();

  if (variant.styleFamily === 'arrows') {
    ctx.strokeStyle = 'rgba(91,62,43,0.35)';
    ctx.lineWidth = Math.max(2, width * 0.003);
    [[0.1, 0.44, 0.42, 0.5, 0.1, 0.56], [0.9, 0.44, 0.58, 0.5, 0.9, 0.56], [0.22, 0.2, 0.45, 0.34, 0.22, 0.48], [0.78, 0.2, 0.55, 0.34, 0.78, 0.48]].forEach((p) => {
      ctx.beginPath();
      ctx.moveTo(width * p[0], height * p[1]);
      ctx.lineTo(width * p[2], height * p[3]);
      ctx.lineTo(width * p[4], height * p[5]);
      ctx.stroke();
    });
  }

  ctx.fillStyle = 'rgba(255,255,255,0.84)';
  drawRoundedRect(ctx, width * 0.08, height * 0.1, width * 0.18, height * 0.055, 999);
  ctx.fill();
  ctx.fillStyle = '#6d4b35';
  ctx.font = `${Math.round(width * 0.022)}px Inter, Arial`;
  ctx.fillText(format.label, width * 0.105, height * 0.138);

  const packshotAreaX = variant.sourceType === 'bundle' ? width * 0.58 : width * 0.67;
  const packshotAreaY = height * 0.2;
  const packshotAreaW = width * 0.24;
  const packshotAreaH = height * 0.46;
  const imageList = getVariantImageList(variant);

  if (imageList.length) {
    for (const [idx, src] of imageList.entries()) {
      try {
        const img = await loadImage(src);
        const x = packshotAreaX + idx * width * 0.06;
        const y = packshotAreaY + idx * height * 0.03;
        ctx.save();
        drawRoundedRect(ctx, x, y, packshotAreaW, packshotAreaH, 24);
        ctx.clip();
        ctx.drawImage(img, x, y, packshotAreaW, packshotAreaH);
        ctx.restore();
        const shouldRemoveWhite = variant.imageMode !== 'lifestyle' && (!src.startsWith('data:') || variant.imageMode === 'packshot');
        if (shouldRemoveWhite) {
          removeWhiteBackground(ctx, Math.round(x), Math.round(y), Math.round(packshotAreaW), Math.round(packshotAreaH));
        }
      } catch {
        drawPackshot(ctx, variant.packshotShape, packshotAreaX + idx * width * 0.06, packshotAreaY + idx * height * 0.03, packshotAreaW, packshotAreaH, variant.packshotPalette, variant.assetSlots[idx] || 'packshot');
      }
    }
  } else {
    variant.assetSlots.slice(0, variant.sourceType === 'bundle' ? 2 : 1).forEach((slot, idx) => {
      drawPackshot(ctx, variant.packshotShape, packshotAreaX + idx * width * 0.06, packshotAreaY + idx * height * 0.03, packshotAreaW, packshotAreaH, variant.packshotPalette, slot);
    });
  }

  ctx.fillStyle = '#2f241f';
  ctx.font = `700 ${Math.round(width * 0.05)}px Inter, Arial`;
  const headlineLines = wrapText(ctx, variant.headline, width * 0.48);
  headlineLines.slice(0, 3).forEach((line, idx) => {
    ctx.fillText(line, width * 0.09, height * (0.28 + idx * 0.068));
  });

  ctx.fillStyle = '#5f4c42';
  ctx.font = `${Math.round(width * 0.024)}px Inter, Arial`;
  const subLines = wrapText(ctx, variant.subheadline, width * 0.48);
  subLines.slice(0, 2).forEach((line, idx) => {
    ctx.fillText(line, width * 0.09, height * (0.5 + idx * 0.04));
  });

  let bulletX = width * 0.09;
  let bulletY = height * 0.62;
  ctx.font = `${Math.round(width * 0.018)}px Inter, Arial`;
  variant.benefits.slice(0, 4).forEach((bullet) => {
    const tagWidth = Math.min(width * 0.31, ctx.measureText(bullet).width + width * 0.036);
    if (bulletX + tagWidth > width * 0.71) {
      bulletX = width * 0.09;
      bulletY += height * 0.055;
    }
    ctx.fillStyle = 'rgba(255,255,255,0.76)';
    drawRoundedRect(ctx, bulletX, bulletY, tagWidth, height * 0.042, 999);
    ctx.fill();
    ctx.fillStyle = '#5f4739';
    ctx.fillText(bullet, bulletX + width * 0.012, bulletY + height * 0.028);
    bulletX += tagWidth + width * 0.012;
  });

  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  drawRoundedRect(ctx, width * 0.09, height * 0.84, width * 0.2, height * 0.055, 16);
  ctx.fill();
  ctx.fillStyle = '#4b392e';
  ctx.font = `700 ${Math.round(width * 0.02)}px Inter, Arial`;
  ctx.fillText(variant.logoText, width * 0.107, height * 0.875);

  ctx.fillStyle = '#69462f';
  drawRoundedRect(ctx, width * 0.72, height * 0.83, width * 0.18, height * 0.06, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(width * 0.02)}px Inter, Arial`;
  ctx.fillText(variant.cta, width * 0.745, height * 0.868);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}

function clearExportLinks() {
  exportLinks.innerHTML = '';
  exportManifest = [];
  exportFiles = [];
}

function addExportLink(name, dataUrl, variant, format, blob) {
  const link = document.createElement('a');
  link.className = 'export-link';
  link.href = dataUrl;
  link.download = name;
  link.textContent = `⬇ ${name}`;
  exportLinks.appendChild(link);
  exportManifest.push({
    fileName: name,
    variantId: variant.id,
    productName: variant.productName,
    format: format.label,
    style: variant.styleFamily,
    approved: variant.status === 'approved',
  });
  exportFiles.push({ name, blob });
}

async function buildExports() {
  const selected = variants.filter((item) => item.status === 'approved');
  if (!selected.length) {
    alert('Nejdřív schval aspoň jednu variantu.');
    return false;
  }
  clearExportLinks();
  exportSummary.textContent = 'Renderuju PNG exporty, chvilku…';
  for (const [variantIndex, variant] of selected.entries()) {
    for (const format of formats) {
      const canvas = await renderVariantPng(variant, format);
      const blob = await canvasToBlob(canvas);
      const dataUrl = canvas.toDataURL('image/png');
      const safeName = sanitizeFileName(variant.productName);
      const fileName = `${safeName}-v${variantIndex + 1}-${format.label.replace(':', 'x')}.png`;
      addExportLink(fileName, dataUrl, variant, format, blob);
    }
  }
  exportSummary.textContent = `Hotovo, připravil jsem ${selected.length * formats.length} PNG exportů ke stažení.`;
  return true;
}

function serializeProject() {
  return {
    id: `${sanitizeFileName(projectNameInput.value)}-${Date.now()}`,
    savedAt: new Date().toISOString(),
    projectName: projectNameInput.value.trim() || 'banner-set-1',
    form: Object.fromEntries(new FormData(form).entries()),
    variants,
  };
}

function applyProject(project) {
  if (!project?.form || !Array.isArray(project?.variants)) {
    throw new Error('Neplatný formát projektu.');
  }
  const inputType = project.form.inputType || 'product';
  inputTypeSelect.value = inputType;
  populateCatalogSelect(inputType);
  Object.entries(project.form).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value;
  });
  if (project.form.catalogId) catalogSelect.value = project.form.catalogId;
  variants = project.variants.map((variant) => ({
    ...variant,
    benefits: [...(variant.benefits || [])],
    assetSlots: [...(variant.assetSlots || [])],
    imagePaths: [...(variant.imagePaths || [])],
    altImagePaths: [...(variant.altImagePaths || [])],
    imageMode: variant.imageMode || 'auto',
  }));
  if (project.projectName) projectNameInput.value = project.projectName;
  updateFeedStrip(inputType, project.form.catalogId);
  clearExportLinks();
  closeEditor();
  rerender();
  projectSummary.textContent = `Načten projekt „${project.projectName || 'bez názvu'}“ (${variants.length} variant).`;
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function dateToDosTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return ((year - 1980) << 25) | (month << 21) | (day << 16) | (hours << 11) | (minutes << 5) | (seconds >> 1);
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function u32(value) {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

async function createZipBlob(files) {
  const encoder = new TextEncoder();
  const fileData = await Promise.all(files.map(async (file) => ({
    nameBytes: encoder.encode(file.name),
    data: new Uint8Array(await file.blob.arrayBuffer()),
    date: new Date(),
  })));

  const chunks = [];
  const centralChunks = [];
  let offset = 0;

  fileData.forEach((file) => {
    const crc = crc32(file.data);
    const dosTime = dateToDosTime(file.date);
    const localHeader = new Uint8Array([
      0x50, 0x4b, 0x03, 0x04,
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(dosTime & 0xffff),
      ...u16((dosTime >>> 16) & 0xffff),
      ...u32(crc),
      ...u32(file.data.length),
      ...u32(file.data.length),
      ...u16(file.nameBytes.length),
      ...u16(0),
    ]);
    chunks.push(localHeader, file.nameBytes, file.data);

    const centralHeader = new Uint8Array([
      0x50, 0x4b, 0x01, 0x02,
      ...u16(20),
      ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(dosTime & 0xffff),
      ...u16((dosTime >>> 16) & 0xffff),
      ...u32(crc),
      ...u32(file.data.length),
      ...u32(file.data.length),
      ...u16(file.nameBytes.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
    ]);
    centralChunks.push(centralHeader, file.nameBytes);
    offset += localHeader.length + file.nameBytes.length + file.data.length;
  });

  const centralSize = centralChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const endRecord = new Uint8Array([
    0x50, 0x4b, 0x05, 0x06,
    ...u16(0),
    ...u16(0),
    ...u16(fileData.length),
    ...u16(fileData.length),
    ...u32(centralSize),
    ...u32(offset),
    ...u16(0),
  ]);

  return new Blob([...chunks, ...centralChunks, endRecord], { type: 'application/zip' });
}

exportSelectedBtn.addEventListener('click', async () => {
  await buildExports();
});

downloadAllBtn.addEventListener('click', async () => {
  if (!exportLinks.children.length && !(await buildExports())) return;
  [...exportLinks.querySelectorAll('a')].forEach((link, idx) => {
    setTimeout(() => link.click(), idx * 150);
  });
});

downloadZipBtn.addEventListener('click', async () => {
  if (!exportFiles.length && !(await buildExports())) return;
  exportSummary.textContent = 'Balím PNG do ZIPu…';
  const zipBlob = await createZipBlob(exportFiles);
  downloadBlob(zipBlob, `${sanitizeFileName(projectNameInput.value)}-exports.zip`);
  exportSummary.textContent = `ZIP je připravený, obsahuje ${exportFiles.length} PNG souborů.`;
});

downloadManifestBtn.addEventListener('click', async () => {
  if (!exportManifest.length && !(await buildExports())) return;
  const blob = new Blob([JSON.stringify({ generatedAt: new Date().toISOString(), files: exportManifest }, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'banner-export-manifest.json');
});

saveProjectBtn.addEventListener('click', () => {
  const project = serializeProject();
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
  const existing = getStoredProjects().filter((item) => item.projectName !== project.projectName);
  existing.unshift(project);
  setStoredProjects(existing.slice(0, 12));
  renderProjectList();
  projectSummary.textContent = `Projekt „${project.projectName}“ je uložený lokálně.`;
});

loadProjectBtn.addEventListener('click', () => {
  const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
  if (!raw) {
    projectSummary.textContent = 'Ještě tu není uložený žádný lokální projekt.';
    return;
  }
  try {
    applyProject(JSON.parse(raw));
  } catch (error) {
    projectSummary.textContent = `Načtení selhalo: ${error.message}`;
  }
});

exportProjectBtn.addEventListener('click', () => {
  const project = serializeProject();
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${sanitizeFileName(project.projectName)}.json`);
  projectSummary.textContent = `Projekt „${project.projectName}“ jsem vyexportoval do JSON.`;
});

importProjectInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    applyProject(JSON.parse(text));
  } catch (error) {
    projectSummary.textContent = `Import selhal: ${error.message}`;
  } finally {
    importProjectInput.value = '';
  }
});

saveEditorBtn.addEventListener('click', () => {
  const variant = variants.find((item) => item.id === activeEditorVariantId);
  if (!variant) return;
  variant.headline = editorHeadline.value.trim() || variant.headline;
  variant.subheadline = editorSubheadline.value.trim() || variant.subheadline;
  variant.cta = editorCta.value.trim() || variant.cta;
  variant.badge = editorBadge.value.trim() || variant.badge;
  variant.benefits = splitBenefits(editorBenefits.value);
  variant.imageMode = editorImageMode.value || 'auto';
  rerender();
  closeEditor();
});

editorImageMode.addEventListener('change', () => {
  const variant = variants.find((item) => item.id === activeEditorVariantId);
  if (!variant) return;
  variant.imageMode = editorImageMode.value || 'auto';
  renderAssetManager(variant);
  rerender();
});

closeEditorBtn.addEventListener('click', () => closeEditor());

inputTypeSelect.addEventListener('change', () => {
  populateCatalogSelect(inputTypeSelect.value);
  const item = getCatalogEntry(inputTypeSelect.value, catalogSelect.value);
  hydrateFormFromCatalog(item, inputTypeSelect.value === 'bundle' ? 'promo' : 'clean');
  if (item) catalogSelect.value = item.id;
  updateFeedStrip(inputTypeSelect.value, item?.id);
});

catalogSelect.addEventListener('change', () => {
  const item = getCatalogEntry(inputTypeSelect.value, catalogSelect.value);
  hydrateFormFromCatalog(item);
  updateFeedStrip(inputTypeSelect.value, item.id);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  variants = generateVariants(payload);
  updateFeedStrip(payload.inputType, payload.catalogId);
  clearExportLinks();
  closeEditor();
  rerender();
});

approveAllBtn.addEventListener('click', () => {
  variants = variants.map((variant) => ({ ...variant, status: 'approved' }));
  rerender();
});

populateCatalogSelect('product');
const defaultItem = getCatalogItems('product')[0];
if (defaultItem) {
  hydrateFormFromCatalog(defaultItem, 'clean');
  catalogSelect.value = defaultItem.id;
  form.elements.imageMode.value = 'packshot';
  updateFeedStrip('product', defaultItem.id);
  variants = generateVariants({
    inputType: 'product',
    catalogId: defaultItem.id,
    productName: defaultItem.name,
    headline: defaultItem.headline,
    benefits: defaultItem.benefits.join('\n'),
    cta: defaultItem.cta,
    assetMode: 'auto',
    imageMode: 'packshot',
    variantCount: 5,
    styleFamily: 'clean',
  });
  rerender();
}

renderProjectList();
