import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    // The main footer background. Padding is now handled by the sections inside.
    <footer className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#0A51A1] to-[#ff3333] shadow-2xl  text-white">
      {/* The top, constrained-width section of the footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Mwananchi Communications LTD</h3>
            <p className="text-sm leading-relaxed">
              Plot no: 34/35 Mandela Road, Tabata Relini,<br />
              Mwananchi, Dar es Salaam, Tanzania
            </p>
            <p className="text-sm mt-4">
              <span className="font-semibold">Phone:</span> +255 754 780 647<br />
              <span className="font-semibold">Email:</span> support@mwananchi.co.tz<br />
              <span className="font-semibold">Advertising:</span> jtarimo@tz.nationmedia.com
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Our Brands</h3>
            <ul className="text-sm space-y-2">
              <li><Link to="/brands/mwanaclick" className="hover:underline">MwanaClick</Link></li>
              <li><Link to="/brands/mwananchi-newspaper" className="hover:underline">Mwananchi newspaper</Link></li>
              <li><Link to="/brands/mwanaspoti-newspaper" className="hover:underline">Mwanaspoti newspaper</Link></li>
              <li><Link to="/brands/the-citizen-newspaper" className="hover:underline">The Citizen newspaper</Link></li>
              <li><Link to="/brands/mwananchi-courier" className="hover:underline">Mwananchi Courier Services</Link></li>
              <li><Link to="/brands/mwananchi-events" className="hover:underline">Mwananchi Events</Link></li>
              <li><Link to="/brands/habari-hub" className="hover:underline">Habari Hub</Link></li>
              <li><Link to="/brands/citizen-rising-woman" className="hover:underline">The Citizen Rising Woman</Link></li>
              <li><Link to="/brands/nation-epaper" className="hover:underline">Nation ePaper</Link></li>
              <li><Link to="/brands/mwananchi-digital" className="hover:underline">Mwananchi Digital</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Our Group Brands</h3>
            <ul className="text-sm space-y-2">
              <li><Link to="/group-brands/nation-africa" className="hover:underline">Nation Africa</Link></li>
              <li><Link to="/group-brands/business-daily-africa" className="hover:underline">Business Daily Africa</Link></li>
              <li><Link to="/group-brands/epapers" className="hover:underline">EPapers</Link></li>
              <li><Link to="/group-brands/monitor" className="hover:underline">Monitor</Link></li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Follow us</h4>
              <div className="flex gap-4 text-lg">
                <a href="https://www.facebook.com/mwananchipapers" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300"><FaFacebookF /></a>
                <a href="https://twitter.com/mwananchi" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300"><FaTwitter /></a>
                <a href="https://www.instagram.com/mwananchipapers" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300"><FaInstagram /></a>
                <a href="https://www.linkedin.com/company/mwananchi-communications-ltd" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300"><FaLinkedinIn /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Full-width footer section with red background */}
      <div className="bg-[#0A51A] border-t border-white/20">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Mwananchi Communications LTD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;