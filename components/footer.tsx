import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import FooterServices from "@/components/footer-services";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {/* <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-primary font-bold">
                TV
              </div> */}
              <span className="font-semibold text-lg">
                Air Current Eng. Solution
              </span>
            </div>
            <p className="text-primary-foreground/90 text-sm">
              Professional HVAC and ventilation engineering solutions for
              commercial and industrial applications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-base mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-accent transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-accent transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-accent transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="hover:text-accent transition-colors"
                >
                  Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-base mb-4">Services</h3>
            <FooterServices />
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-base mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <Phone size={16} className="mt-0.5 flex-shrink-0" />
                <span>+94 70 153 3195</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail size={16} className="mt-0.5 flex-shrink-0" />
                <span>info@aircurrentengineeringsolution.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  Air Current engineering solution , No 25 , 3rd Floor, Highway
                  level road, Maharagama.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-primary-foreground/20 bg-primary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-primary-foreground/80">
            <p>
              &copy; {currentYear} Air Current Eng. Solution. All rights
              reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-accent transition-colors">
                Terms of Service
              </Link>
              <Link href="/site-map" className="hover:text-accent transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
