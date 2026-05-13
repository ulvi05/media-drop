import { IoMdCheckmark } from "react-icons/io";

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 pt-20">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        Convert videos <br />
        <span className="text-zinc-400">to MP3 & MP4 instantly</span>
      </h1>

      <p className="mt-5 text-zinc-500 max-w-xl">
        Paste a YouTube or TikTok link and download your file in seconds. No
        signup, no ads.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
        <span className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1">
          <IoMdCheckmark className="text-green-400" />
          Fast
        </span>

        <span className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1">
          <IoMdCheckmark className="text-green-400" />
          Free
        </span>

        <span className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1">
          <IoMdCheckmark className="text-green-400" />
          No signup
        </span>
      </div>
    </section>
  );
};

export default Hero;
