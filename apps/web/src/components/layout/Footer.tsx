export function Footer() {
  return (
    <footer className="border-t border-[#2a2a2a] py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Store. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
