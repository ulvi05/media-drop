const Footer = () => {
  return (
    <footer className="py-10 text-center text-xs text-zinc-600">
      <p>
        © {new Date().getFullYear()} Media Drop.{" "}
        <a
          href="https://ulvi.space"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-400 transition-all duration-300 hover:underline underline-offset-2"
        >
          Ulvi Aghazade
        </a>
      </p>
    </footer>
  );
};

export default Footer;
