function Footer() {
  return (
    <footer className="bg-emerald-700 text-white py-6 mt-8">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} PharmaGo. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-green-200 transition">About</a>
          <a href="#" className="hover:text-green-200 transition">Contact</a>
          <a href="#" className="hover:text-green-200 transition">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
