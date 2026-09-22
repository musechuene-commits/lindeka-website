import './styles.css';

const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('.nav-links');

toggle?.addEventListener('click', () => {
    const isOpen = nav?.classList.toggle('open') ?? false;
    toggle.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
    });
});

const form = document.querySelector<HTMLFormElement>('#enquiry-form');

form?.querySelector<HTMLInputElement>('input[name="website"]')?.addEventListener('input', () => {
    // Honeypot field intentionally remains hidden.
});