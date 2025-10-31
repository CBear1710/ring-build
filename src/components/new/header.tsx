import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="max-w-[1440px] mx-auto w-full px-4 lg:px-20">
      <div className="w-full flex items-center justify-between pt-10">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image width={100} height={47} src="/logo.png" alt="Logo" />
        </Link>

        {/* Center Title */}
        <div className="flex-1 text-center">
          <h1 className="text-sm text-[13px] md:text-2xl font-semibold text-black">
            3D RING CONFIGURATOR
          </h1>
        </div>

        {/* Contact Us Link */}
        <Link
          href="https://kvytechnology.com/contact"
          target="_blank"
          className="relative rounded w-10 h-10 md:w-[144px] flex items-center justify-center md:h-10 border border-[#D5D7DA] hover:opacity-80 transition-colors"
        >
          <div className="w-full hidden md:flex items-center justify-center gap-[10px]">
            <span className="text-base font-medium">Contact Us</span>
            <span className="text-base">→</span>
          </div>

          <div className="w-full flex items-center justify-center md:hidden">
            <Image width={24} height={24} src="/contact.png" alt="Logo" />
          </div>
        </Link>
      </div>
    </header>
  );
}
