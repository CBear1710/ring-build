"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* BRAND — spans 2 cols & 2 rows at xl */}
          <div className="footer-col footer-col--brand xl:order-1 xl:col-span-2 xl:row-span-2">
            <Image
              src="/brand/Kvytech-white.svg"
              alt="KVY Technology"
              width={160}
              height={40}
              priority
              className="h-10 w-auto"
            />

            <p className="footer-about mt-4">
              KVY TECH, a software development firm based in Ho Chi Minh City,
              empowers businesses with innovative software solutions.
            </p>

            {/* CONTACT */}
            <div className="footer-block footer-contact mt-3">
              <p>
                <strong>Address:</strong>
                <br />
                1069 Phan Van Tri, P.10, Go Vap,
                <br />
                Ho Chi Minh city, Vietnam
              </p>
              <p className="mt-3">+84-902-261-879</p>
              <p>hi@kvytechnology.com</p>
            </div>

            {/* CONNECT */}
            <div className="footer-block footer-connect">
              <h5 className="footer-subtitle">Connect</h5>
              <div className="footer-socials">
                <a href="https://www.linkedin.com/company/kvytechnology" aria-label="LinkedIn" target="_blank" rel="noreferrer noopener">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg" alt="LinkedIn" />
                </a>
                <a href="https://www.facebook.com/kvytechnology" aria-label="Facebook" target="_blank" rel="noreferrer noopener">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/facebook.svg" alt="Facebook" />
                </a>
                <a href="https://github.com/kvytechnology" aria-label="GitHub" target="_blank" rel="noreferrer noopener">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg" alt="GitHub" />
                </a>
                <a href="https://www.instagram.com/kvytechnology" aria-label="Instagram" target="_blank" rel="noreferrer noopener">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/instagram.svg" alt="Instagram" />
                </a>
                <a href="https://medium.com/@kvytechnology" aria-label="Medium" target="_blank" rel="noreferrer noopener">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/medium.svg" alt="Medium" />
                </a>
                <a href="https://dribbble.com/kvytechnology" aria-label="Dribbble" target="_blank" rel="noreferrer noopener">
                  <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/dribbble.svg" alt="Dribbble" />
                </a>
              </div>
            </div>

            {/* BADGES — left: badge; right: stars over GoodFirms; below: SOJ */}
            <div className="footer-badges">
              <div className="footer-badges-grid">
                {/* Left column: award badge */}
                <Image
                  src="/brand/badge.svg"
                  alt="Top Software Development Company"
                  width={224}
                  height={80}
                  className="footer-badge"
                  style={{ height: 60, width: "auto" }}
                />

                {/* Right column: stars above GoodFirms */}
                <div className="footer-badges-right">
                  <Image
                    src="/brand/Rating.svg"
                    alt="5-star rating"
                    width={157}
                    height={24}
                    className="footer-rating"
                  />
                  <Image
                    src="/brand/GoodFirms.svg"
                    alt="GoodFirms"
                    width={161}
                    height={24}
                    className="footer-goodfirms"
                  />
                </div>
              </div>

              {/* Full-width second row */}
              <Image
                src="/brand/badge-2.png"
                alt="Software Outsourcing Journal"
                width={320}
                height={96}
                className="footer-badge2"
                style={{ height: 96, width: "auto" }}
              />
            </div>
          </div>

          {/* ROW 1 (xl): Company, Expertise, Services, Case Studies */}
          <div className="footer-col xl:order-2 xl:col-start-3 xl:row-start-1">
            <h5>Company</h5>
            <ul>
              <li><a href="https://kvytechnology.com/about-us">About us</a></li>
              <li><a href="https://kvytechnology.com/how-we-work">How we work</a></li>
              <li><a href="https://kvytechnology.com/careers">Careers</a></li>
            </ul>
          </div>

          <div className="footer-col xl:order-3 xl:col-start-4 xl:row-start-1">
            <h5>Expertise</h5>
            <ul>
              <li><a href="https://kvytechnology.com/expertise/ecommerce-solutions">Ecommerce Solutions</a></li>
              <li><a href="https://kvytechnology.com/expertise/startup-solutions">Startup Solutions</a></li>
              <li><a href="https://kvytechnology.com/expertise/smb-solutions">SMB Solutions</a></li>
            </ul>
          </div>

          <div className="footer-col footer-col--nowrap xl:order-4 xl:col-start-5 xl:row-start-1">
            <h5>Services</h5>
            <ul>
              <li><a href="https://kvytechnology.com/services/b2c-ecommerce-development">B2C Ecommerce Development</a></li>
              <li><a href="https://kvytechnology.com/services/b2b-ecommerce-development">B2B Ecommerce Development</a></li>
              <li><a href="https://kvytechnology.com/services/d2c-ecommerce-development">D2C Ecommerce Development</a></li>
            </ul>
          </div>

          <div className="footer-col footer-col--nowrap xl:order-5 xl:col-start-6 xl:row-start-1">
            <h5>Case Studies</h5>
            <ul>
              <li><a href="https://kvytechnology.com/case-studies/habbit-d2c-ecommerce">Habbit D2C Ecommence</a></li>
              <li><a href="https://kvytechnology.com/case-studies/mizuma-b2c-ecommerce">Mizuma B2C Ecommerce</a></li>
              <li><a href="https://kvytechnology.com/case-studies/arobid-headless-cms">Arobid Headless CMS</a></li>
              <li><a href="https://kvytechnology.com/case-studies/ademco-custom-software">Ademco Custom Software</a></li>
              <li><a href="https://kvytechnology.com/case-studies/eyeset-cross-platform-app">Eyeset Cross Platform App</a></li>
            </ul>
          </div>

          {/* ROW 2 (xl): Resources, Technologies, Services */}
          <div className="footer-col xl:order-6 xl:col-start-3 xl:row-start-2">
            <h5>Resources</h5>
            <ul>
              <li><a href="https://kvytechnology.com/blog">Blog</a></li>
              <li><a href="https://kvytechnology.com/resources/ebooks">EBooks</a></li>
              <li><a href="https://kvytechnology.com/resources/guides">Guides</a></li>
              <li><a href="https://kvytechnology.com/resources/videos">Videos</a></li>
            </ul>
          </div>

          <div className="footer-col xl:order-7 xl:col-start-4 xl:row-start-2">
            <h5>Technologies</h5>
            <ul>
              <li><a href="https://kvytechnology.com/technologies/shopify">Shopify</a></li>
              <li><a href="https://kvytechnology.com/technologies/medusajs">Medusa.js</a></li>
              <li><a href="https://kvytechnology.com/technologies/strapijs">Strapi.js</a></li>
              <li><a href="https://kvytechnology.com/technologies/sanity">Sanity</a></li>
              <li><a href="https://kvytechnology.com/technologies/nodejs">Node.js</a></li>
              <li><a href="https://kvytechnology.com/technologies/ruby-on-rails">Ruby on Rails</a></li>
              <li><a href="https://kvytechnology.com/technologies/reactjs">React.js</a></li>
              <li><a href="https://kvytechnology.com/technologies/react-native">React Native</a></li>
            </ul>
          </div>

          <div className="footer-col footer-col--nowrap xl:order-8 xl:col-start-5 xl:row-start-2">
            <h5>Services</h5>
            <ul>
              <li><a href="https://kvytechnology.com/services/web-development">Web Development</a></li>
              <li><a href="https://kvytechnology.com/services/mobile-development">Mobile Development</a></li>
              <li><a href="https://kvytechnology.com/services/mvp-development">MVP Development</a></li>
              <li><a href="https://kvytechnology.com/services/cms-development">CMS Development</a></li>
              <li><a href="https://kvytechnology.com/services/ui-ux-design">UI/UX Design</a></li>
              <li><a href="https://kvytechnology.com/services/software-development">Software Development</a></li>
              <li><a href="https://kvytechnology.com/services/consulting">Consulting</a></li>
              <li><a href="https://kvytechnology.com/services/product-discovery">Product Discovery</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bar">
          <ul className="footer-inline">
            <li><a href="https://kvytechnology.com/privacy-policy">Privacy</a></li>
            <li><a href="https://kvytechnology.com/terms-of-use">Term of use</a></li>
          </ul>
          <p className="copyright">
            Copyright © {new Date().getFullYear()} KVY TECHNOLOGY COMPANY LIMITED. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
