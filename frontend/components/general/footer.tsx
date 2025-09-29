export default function Footer() {
  return (
    <footer className="border-t border-foreground/10 mt-10 py-8 text-center text-sm text-foreground/70">
      © {new Date().getFullYear()} LiveCode — All rights reserved.
    </footer>
  );
}