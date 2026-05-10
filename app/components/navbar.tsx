"use client";

import { VscGithubAlt } from "react-icons/vsc";
import { CiMusicNote1 } from "react-icons/ci";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/40 bg-zinc-950/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* LEFT - Logo */}
        <div className="flex items-center gap-2 text-lg font-bold text-zinc-200">
          <CiMusicNote1 size={28} className="text-white" />
          <span className="tracking-wide">Media Drop</span>
        </div>

        {/* RIGHT - Github */}
        <a
          href="https://github.com/ulvi05"
          target="_blank"
          className="group flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 text-zinc-300 transition-all duration-300 hover:bg-zinc-800 hover:text-white"
        >
          <span className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 group-hover:animate-wave">
            <VscGithubAlt size={24} />
          </span>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
