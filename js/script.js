document.addEventListener("DOMContentLoaded", function () {
  initCart();
  initPaymentModal();
  initCheckout();
  initEnquiryForm();
  initAccordion();
  initTabs();
  initRippleEffect();
  initBubbles();
  initScrollReveal();
  initNavActiveState();
});

// cart
const CART_KEY = "buddyDkotaCart";

function getCart() {
  const stored = sessionStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(name, price) {
  const cart = getCart();
  const existing = cart.find((item) => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name: name, price: price, qty: 1 });
  }

  saveCart(cart);
  renderCart();
}

function removeFromCart(name) {
  let cart = getCart();
  cart = cart.filter((item) => item.name !== name);
  saveCart(cart);
  renderCart();
}

function changeQty(name, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.name === name);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    return removeFromCart(name);
  }
  saveCart(cart);
  renderCart();
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCart() {
  const cart = getCart();

  const countEl = document.getElementById("cartCount");
  if (countEl) {
    animateCountChange(countEl, cartCount(cart));
  }

  const totalEl = document.getElementById("cartTotal");
  if (totalEl) {
    totalEl.textContent = cartTotal(cart).toFixed(2);
  }

  const listEl = document.getElementById("cartItemsList");
  if (listEl) {
    renderCartItemsList(listEl, cart);
  }
}

function animateCountChange(el, newValue) {
  el.textContent = newValue;
  el.classList.remove("cart-count-pop");
  void el.offsetWidth;
  el.classList.add("cart-count-pop");
}

function renderCartItemsList(listEl, cart) {
  listEl.innerHTML = "";

  if (cart.length === 0) {
    const empty = document.createElement("li");
    empty.className = "cart-empty";
    empty.textContent = "Your cart is empty.";
    listEl.appendChild(empty);
    return;
  }

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cart-line";

    const label = document.createElement("span");
    label.className = "cart-line-label";
    label.textContent = item.name + " — R" + (item.price * item.qty).toFixed(2);

    const controls = document.createElement("span");
    controls.className = "cart-line-controls";

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.textContent = "−";
    minusBtn.setAttribute("aria-label", "Remove one " + item.name);
    minusBtn.addEventListener("click", () => changeQty(item.name, -1));

    const qty = document.createElement("span");
    qty.className = "cart-line-qty";
    qty.textContent = item.qty;

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.textContent = "+";
    plusBtn.setAttribute("aria-label", "Add one more " + item.name);
    plusBtn.addEventListener("click", () => changeQty(item.name, 1));

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "cart-line-remove";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeFromCart(item.name));

    controls.append(minusBtn, qty, plusBtn, removeBtn);
    li.append(label, controls);
    listEl.appendChild(li);
  });
}

function initCart() {
  renderCart();

  const addButtons = document.querySelectorAll(".add-cart");
  addButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const name = btn.getAttribute("data-name");
      const price = parseFloat(btn.getAttribute("data-price"));

      if (!name || isNaN(price)) return;

      addToCart(name, price);
      showAddedFeedback(btn);
      spawnRipple(e, btn);
    });
  });
}

function showAddedFeedback(btn) {
  const original = btn.textContent;
  btn.textContent = "Added ✓";
  btn.classList.add("add-cart--added");
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("add-cart--added");
    btn.disabled = false;
  }, 900);
}

// payment modal 
function initPaymentModal() {
  const modal = document.getElementById("paymentMethod");
  if (!modal) return;

  const closeTriggers = modal.querySelectorAll(
    "[data-close-modal], .modal-close"
  );
  closeTriggers.forEach((el) =>
    el.addEventListener("click", () => closeModal(modal))
  );

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal(modal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("modal--open")) {
      closeModal(modal);
    }
  });

  const confirmBtn = document.getElementById("confirmPayment");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", handleConfirmPayment);
  }
}

function openModal(modal) {
  modal.classList.add("modal--open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  const cart = getCart();
  const totalEl = modal.querySelector("#cartTotal");
  if (totalEl) totalEl.textContent = cartTotal(cart).toFixed(2);
}

function closeModal(modal) {
  modal.classList.remove("modal--open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

function handleConfirmPayment() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty — add a product before confirming payment.");
    return;
  }

  const select = document.getElementById("paymentMethod_select") ||
    document.querySelector("#paymentMethod select");
  const method = select ? select.value : "Cash";

  const total = cartTotal(cart).toFixed(2);

  alert(
    "Thank you! Your order of R" + total + " via " + method +
    " has been received. We'll confirm shortly by phone or email."
  );

  saveCart([]);
  renderCart();

  const modal = document.getElementById("paymentMethod");
  if (modal) closeModal(modal);
}

// checkout button
function initCheckout() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", function () {
    const cart = getCart();

    if (cart.length === 0) {
      alert("Your cart is empty. Add a bottle or two before checking out!");
      return;
    }

    const summary = cart
      .map((item) => item.qty + " × " + item.name)
      .join(", ");
    alert(
      "Order summary: " + summary +
      "\nTotal: R" + cartTotal(cart).toFixed(2) +
      "\nChoose a payment method to confirm."
    );

    const modal = document.getElementById("paymentMethod");
    if (modal) openModal(modal);
  });
}

// enquiry form
function initEnquiryForm() {
  const form = document.getElementById("enquiryForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const phone = document.getElementById("number")?.value.trim();
    const product = document.getElementById("product")?.value;
    const quantity = document.getElementById("quantity")?.value;

    if (!name || !email || !phone || !quantity) {
      alert("Please fill in every field before requesting a quote.");
      return;
    }

    alert(
      "Thanks " + name + "! We've received your enquiry for " +
      quantity + " × " + product +
      ". We'll reach out to " + email + " or " + phone + " shortly."
    );

    form.reset();
  });
}

// accordion animation
function initAccordion() {
  const triggers = document.querySelectorAll(".accordion-trigger");
  if (triggers.length === 0) return;

  function openPanel(trigger) {
    const panel = trigger.nextElementSibling;
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    if (isOpen) return;

    const group = trigger.closest(".accordion");
    if (group) {
      group.querySelectorAll(".accordion-trigger").forEach((t) => {
        if (t !== trigger) {
          t.setAttribute("aria-expanded", "false");
          const p = t.nextElementSibling;
          if (p) {
            p.style.maxHeight = null;
            p.classList.remove("accordion-panel--open");
          }
        }
      });
    }

    trigger.setAttribute("aria-expanded", "true");
    panel.classList.add("accordion-panel--open");
    panel.style.maxHeight = panel.scrollHeight + "px";
  }

  function closePanel(trigger) {
    const panel = trigger.nextElementSibling;
    trigger.setAttribute("aria-expanded", "false");
    panel.style.maxHeight = null;
    panel.classList.remove("accordion-panel--open");
  }

  triggers.forEach((trigger) => {
    // desktop: hover opens it
    trigger.addEventListener("mouseenter", function () {
      openPanel(trigger);
    });

    // touch/keyboard fallback: click toggles it
    trigger.addEventListener("click", function () {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closePanel(trigger);
      } else {
        openPanel(trigger);
      }
    });
  });

  const first = triggers[0];
  openPanel(first);
}
// tabs
function initTabs() {
  const tabLists = document.querySelectorAll('[role="tablist"]');
  if (tabLists.length === 0) return;

  tabLists.forEach((tabList) => {
    const tabs = tabList.querySelectorAll('[role="tab"]');

    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        activateTab(tab, tabs);
      });

      tab.addEventListener("keydown", function (e) {
        const tabsArray = Array.from(tabs);
        const currentIndex = tabsArray.indexOf(tab);
        let nextIndex = null;

        if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabsArray.length;
        if (e.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;

        if (nextIndex !== null) {
          tabsArray[nextIndex].focus();
          activateTab(tabsArray[nextIndex], tabs);
        }
      });
    });

    if (tabs.length > 0) activateTab(tabs[0], tabs);
  });
}

function activateTab(selectedTab, allTabs) {
  allTabs.forEach((tab) => {
    const panel = document.getElementById(tab.getAttribute("data-tab"));
    const isSelected = tab === selectedTab;

    tab.setAttribute("aria-selected", String(isSelected));
    tab.classList.toggle("tab--active", isSelected);

    if (panel) {
      panel.hidden = !isSelected;
      if (isSelected) {
        panel.classList.remove("tabpanel-fade");
        void panel.offsetWidth;
        panel.classList.add("tabpanel-fade");
      }
    }
  });
}

// highlight navbar
function initRippleEffect() {
  const rippleTargets = document.querySelectorAll(
    ".explore-button, button, .add-cart"
  );

  rippleTargets.forEach((el) => {
    el.addEventListener("click", function (e) {
      spawnRipple(e, el);
    });
  });
}

function spawnRipple(e, el) {
  const rect = el.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";

  const size = Math.max(rect.width, rect.height) * 1.6;
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
  ripple.style.top = (e.clientY - rect.top - size / 2) + "px";

  // ensure the parent button can contain an absolutely positioned ripple
  const computedPosition = getComputedStyle(el).position;
  if (computedPosition === "static") {
    el.style.position = "relative";
  }
  el.style.overflow = "hidden";

  el.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

// ambient bubbles
function initBubbles() {
  let field = document.querySelector(".bubble-field");

  if (!field) {
    field = document.querySelector(".home-page");
  }
  if (!field) return;

  const bubbleCount = 14;

  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement("span");
    bubble.className = "bubble";

    const size = 6 + Math.random() * 18;
    const left = Math.random() * 100;
    const duration = 6 + Math.random() * 8;
    const delay = Math.random() * 6;

    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.left = left + "%";
    bubble.style.animationDuration = duration + "s";
    bubble.style.animationDelay = "-" + delay + "s";

    field.appendChild(bubble);
  }
}

// scroll reveal
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal-on-scroll");
  const autoTargets = document.querySelectorAll(
    ".products-card, .about-content, .enquiry-form, footer, .home-page h1, .home-page h3, .home-page p"
  );
  autoTargets.forEach((el) => el.classList.add("reveal-on-scroll"));

  const allTargets = document.querySelectorAll(".reveal-on-scroll");

  if (!("IntersectionObserver" in window)) {
    allTargets.forEach((el) => el.classList.add("reveal-on-scroll--visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-on-scroll--visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  allTargets.forEach((el) => observer.observe(el));
}

// active navbar
function initNavActiveState() {
  const links = document.querySelectorAll("header nav a");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("nav-active");
      link.parentElement.classList.add("nav-active-cell");
    }
  });
}