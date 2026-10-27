import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/blog", label: "Blog" },
] as const;

const moreNav = [
  { to: "/how-we-work", label: "How we work" },
  { to: "/case-studies", label: "Case studies" },
  { to: "/faq", label: "FAQ" },
  { to: "/shop", label: "Gadgets" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  }

  const linkClass =
    "rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-foreground";

  return (
    <header className="surface-ink sticky top-0 z-50 border-b border-ink-muted/20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-20">
        {/* Logo Section */}
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <img
            src="/logo.png"
            alt="Epaws Solutions"
            className="h-8 w-auto object-contain sm:h-10 md:h-14"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className={linkClass}
            >
              {item.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`${linkClass} inline-flex items-center gap-1 outline-none data-[state=open]:text-foreground`}
            >
              More
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {moreNav.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link to={item.to} className="cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-2 lg:flex">
          {signedIn ? (
            <>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="text-ink-muted hover:text-foreground"
              >
                <Link to="/admin">Dashboard</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-ink-muted hover:text-foreground"
                onClick={() => void signOut()}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="text-ink-muted hover:text-foreground"
              >
                <Link to="/auth" search={{ mode: "signin" }}>
                  Login
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary" className="font-semibold">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Register
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-md border border-ink-muted/30 text-ink-muted lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {open ? (
        <div className="surface-ink border-t border-ink-muted/20 lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm font-medium text-ink-muted"
              >
                {item.label}
              </Link>
            ))}
            <p className="mt-2 px-2 text-xs font-semibold tracking-widest text-ink-muted/70 uppercase">
              More
            </p>
            {moreNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-primary" }}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm font-medium text-ink-muted"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-3 grid grid-cols-2 gap-2">
              {signedIn ? (
                <>
                  <Button asChild variant="outline" className="text-foreground">
                    <Link to="/admin" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-foreground"
                    onClick={() => {
                      setOpen(false);
                      void signOut();
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="text-foreground">
                    <Link to="/auth" search={{ mode: "signin" }} onClick={() => setOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="font-semibold">
                    <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
