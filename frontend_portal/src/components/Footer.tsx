import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    // Replaced gradient with a single color and removed sticky positioning/shadow.
    <footer className="w-full bg-[#0A51A1] text-white">
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
            {/* Kept hover:underline as it's a standard link style, not a color change */}
            <ul className="text-sm space-y-2">
              <li><Link to="/https://mwanaclick.com/" className="hover:underline">MwanaClick</Link></li>
              <li><Link to="/https://www.mwananchi.co.tz/mw" className="hover:underline">Mwananchi newspaper</Link></li>
              <li><Link to="/https://www.mwanaspoti.co.tz/ms" className="hover:underline">Mwanaspoti newspaper</Link></li>
              <li><Link to="/https://www.thecitizen.co.tz/" className="hover:underline">The Citizen newspaper</Link></li>
              <li><Link to="/brands/mwananchi-courier" className="hover:underline">Mwananchi Courier Services</Link></li>
              <li><Link to="/brands/mwananchi-events" className="hover:underline">Mwananchi Events</Link></li>
              <li><Link to="/brands/habari-hub" className="hover:underline">Habari Hub</Link></li>
              <li><Link to="/brands/citizen-rising-woman" className="hover:underline">The Citizen Rising Woman</Link></li>
              <li><Link to="/brands/nation-epaper" className="hover:underline">Nation ePaper</Link></li>
              <li><Link to="/https://www.youtube.com/@Mwananchidigital" className="hover:underline">Mwananchi Digital</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Our Group Brands</h3>
            <ul className="text-sm space-y-2">
              <li><Link to="/https://nation.africa/kenya" className="hover:underline">Nation Africa</Link></li>
              <li><Link to="/https://www.businessdailyafrica.com/" className="hover:underline">Business Daily Africa</Link></li>
              <li><Link to="/https://epaper.nationmedia.com/kenya" className="hover:underline">EPapers</Link></li>
              <li><Link to="/https://mcl.co.tz/Monitor" className="hover:underline">Monitor</Link></li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Follow us</h4>
              <div className="flex gap-4 text-lg">
                {/* Removed hover color, using opacity instead */}
                <a href="https://www.facebook.com/mwananchipapers" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity"><FaFacebookF /></a>
                <a href="https://twitter.com/mwananchi" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity"><FaTwitter /></a>
                <a href="https://www.instagram.com/mwananchipapers" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity"><FaInstagram /></a>
                <a href="https://www.linkedin.com/company/mwananchi-communications-ltd" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity"><FaLinkedinIn /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Removed the separate background color to make the whole footer one color */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Mwananchi Communications LTD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;