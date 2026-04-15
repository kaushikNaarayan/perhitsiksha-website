import React, { useState, useEffect } from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import YouTubeEmbed from '../components/ui/YouTubeEmbed';
import YouTubeShortsCarousel from '../components/ui/YouTubeShortsCarousel';
import PeekCarousel from '../components/ui/PeekCarousel';
import EventsCarousel from '../components/ui/EventsCarousel';
import type { Testimonial } from '../types';

// Import data
import testimonialsData from '../data/testimonials.json';
import facebookEventsData from '../data/facebook-events.json';
import type { Event } from '../types';

// Import images
import heroBgImage from '../assets/images/hero-bg.png';

const certificates = [
  {
    name: 'Certificate of Incorporation',
    image: '/certificate-of-incorporation.jpg',
    link: 'https://drive.google.com/file/d/1ozwZyO0k4ZiZUWqoTQh60qHTI_w5K2L_/view',
  },
  {
    name: '12A Certificate',
    image: '/12A-certificate.jpg',
    link: '/12A-certificate.pdf',
  },
  {
    name: '80G Certificate',
    image: '/80G-certificate.jpg',
    link: '/80G-certificate.pdf',
  },
  {
    name: 'CSR Registration',
    image: '/CSR-certificate.jpg',
    link: '/CSR-certificate.pdf',
  },
];

const Home: React.FC = () => {
  const [voicesTestimonials, setVoicesTestimonials] = useState<Testimonial[]>(
    []
  );
  const [certIndex, setCertIndex] = useState(0);
  const [certPaused, setCertPaused] = useState(false);

  // Celebrity endorsements data for carousel — ordered newest first
  const celebrityEndorsements = [
    {
      id: '1',
      name: 'Sunil Shetty',
      videoId: 'ctqDft-Xrb0',
      profession: 'Actor & Film Producer',
    },
    {
      id: '2',
      name: 'Satwiksairaj Rankireddy',
      videoId: 'U4fnK-_HCXw',
      profession: 'Badminton Player',
    },
    {
      id: '3',
      name: 'Saina Nehwal',
      videoId: 'uH5t-gXKhzc',
      profession: 'Badminton Player',
    },
    {
      id: '4',
      name: 'Sania Mirza',
      videoId: 'jzkOt0RYJLI',
      profession: 'Tennis Player',
    },
    {
      id: '5',
      name: 'Mohammad Azharuddin',
      videoId: 'RAxeVaOgKW0',
      profession: 'Cricketer',
    },
    {
      id: '6',
      name: 'Kidambi Srikanth',
      videoId: 'Z3ps_cG0UjM',
      profession: 'Badminton Star',
    },
    {
      id: '7',
      name: 'VVS Laxman',
      videoId: 'dEWv_0c-omo',
      profession: 'Cricketer',
    },
    {
      id: '8',
      name: 'Pullela Gopichand',
      videoId: '9Cw2TarHBM8',
      profession: 'Badminton Coach',
    },
    {
      id: '9',
      name: 'Atul Wassan',
      videoId: '4Z9V_wbU5mg',
      profession: 'Cricket Commentator',
    },
    {
      id: '10',
      name: 'Suresh Raina',
      videoId: 'G3RbOb5t22E',
      profession: 'Cricketer',
    },
    {
      id: '11',
      name: 'Venkatesh Prasad',
      videoId: '5Ft1a0I1LHo',
      profession: 'Former Cricketer',
    },
    {
      id: '12',
      name: 'Anjum Sharma',
      videoId: 'pI6ZTT17-QA',
      profession: 'Actor',
    },
    {
      id: '13',
      name: 'Ravi Dubey',
      videoId: '2WgZU1tg0gI',
      profession: 'Actor',
    },
    {
      id: '14',
      name: 'Amala Akkineni',
      videoId: 'g9viUStaIUI',
      profession: 'Actress',
    },
    {
      id: '15',
      name: 'Madhur Bhandarkar',
      videoId: 'LD5Qzq7pxwg',
      profession: 'Film Director',
    },
    {
      id: '16',
      name: 'Priyamani',
      videoId: 'l4JAmumyw5k',
      profession: 'Actress',
    },
  ];

  useEffect(() => {
    // Load student testimonials for Voices of Change carousel
    const studentTestimonials = (testimonialsData as Testimonial[]).filter(
      t => t.role === 'Student' && t.youtubeId
    );
    setVoicesTestimonials(studentTestimonials);
  }, []);

  // Auto-rotate certificates every 5s
  useEffect(() => {
    if (certPaused) return;
    const timer = setInterval(() => {
      setCertIndex(prev => (prev + 1) % certificates.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [certPaused]);

  const programs = [
    {
      id: '1',
      title: 'Financial Aid',
      description:
        'Direct financial support for tuition, books, and living expenses to help students complete their education.',
    },
    {
      id: '2',
      title: 'Mentorship',
      description:
        'One-on-one guidance from industry professionals to help students navigate their academic and career journey.',
    },
    {
      id: '3',
      title: 'Career Guidance',
      description:
        'Comprehensive career counseling, interview preparation, and job placement assistance.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="CLSI Perhitsiksha"
        subheadline="300+ Success Stories. 600+ Global Contributors. One Mission."
        subtitle="No student should drop out because of a lack of funds. Perhitsiksha Foundation provides a lifeline of financial aid and career guidance to ensure talent never goes to waste."
        showLogo={true}
        primaryCTA={{
          text: 'Become a Contributor',
          href: 'https://wa.me/918142238633?text=Hi,%20I%20would%20like%20to%20contribute.',
        }}
        stats={[]}
        backgroundImage={heroBgImage}
        overlay={false}
      />

      {/* Celebrity Endorsements */}
      <section className="bg-primary-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-6">
            <p className="body-large max-w-2xl mx-auto">Our Supporters</p>
          </div>
          <YouTubeShortsCarousel endorsements={celebrityEndorsements} />
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-8">
            <h2 className="heading-2 mb-2">What We Do</h2>
            <p className="body-large max-w-2xl mx-auto mb-6">
              We believe every deserving student should have access to quality
              education, regardless of their financial background.
            </p>

            {/* Programs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {programs.map(program => (
                <Card key={program.id} className="p-4 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {program.title}
                  </h3>
                  <p className="text-sm text-gray-600">{program.description}</p>
                </Card>
              ))}
            </div>

            {/* Video Introduction */}
            <div className="max-w-4xl mx-auto">
              <YouTubeEmbed
                videoId="-slFir-pGh0"
                title="Perhitsiksha - What We Do"
                lazyLoad={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Voices of Change Testimonial Carousel */}
      {voicesTestimonials.length > 0 && (
        <section className="bg-primary-50 section-padding">
          <div className="max-w-6xl mx-auto container-padding text-center">
            <h2 className="heading-2 mb-4">Voices of Change</h2>
            <p className="body-large mb-8">
              Hear directly from our students about the impact of education.
            </p>

            <PeekCarousel testimonials={voicesTestimonials} />

            <div className="mt-8">
              <Button href="/testimonials" variant="primary">
                See All Testimonials
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Recent Events */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
              OUR LATEST UPDATES
            </p>
            <h2 className="heading-2">From Our Community</h2>
          </div>

          <EventsCarousel
            events={facebookEventsData as Event[]}
            autoRotateInterval={4000}
          />
        </div>
      </section>

      {/* Official Registration Announcement */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 ring-1 ring-primary-400/20 shadow-xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Certificate Carousel */}
                <div
                  className="lg:col-span-5"
                  onMouseEnter={() => setCertPaused(true)}
                  onMouseLeave={() => setCertPaused(false)}
                >
                  <div className="relative">
                    <a
                      href={certificates[certIndex].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                        {certificates.map((cert, i) => (
                          <img
                            key={cert.name}
                            src={cert.image}
                            alt={cert.name}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === certIndex ? 'opacity-100' : 'opacity-0'}`}
                          />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white text-sm font-semibold drop-shadow-lg">
                            {certificates[certIndex].name}
                          </p>
                        </div>
                      </div>
                    </a>

                    {/* Prev/Next arrows */}
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setCertIndex(
                          (certIndex - 1 + certificates.length) %
                            certificates.length
                        );
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
                      aria-label="Previous certificate"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setCertIndex((certIndex + 1) % certificates.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
                      aria-label="Next certificate"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-3">
                      {certificates.map((cert, i) => (
                        <button
                          key={cert.name}
                          onClick={() => setCertIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === certIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
                          aria-label={cert.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="lg:col-span-7">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl leading-tight font-bold text-gray-900 mb-4">
                    Officially Registered
                  </h2>
                  <p className="text-lg sm:text-xl text-white/90 max-w-2xl mb-8">
                    Perhitsiksha Foundation is now officially registered as
                    Section 8 Company under the Companies Act, 2013, issued by
                    the Ministry of Corporate Affairs, Central Registration
                    Centre.
                  </p>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            CIN Number
                          </p>
                          <p className="text-xs text-white/80 font-mono">
                            U85500UP2025NPL237759
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Date of Incorporation
                          </p>
                          <p className="text-xs text-white/80">
                            December 6, 2025
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            PAN Number
                          </p>
                          <p className="text-xs text-white/80 font-mono">
                            AAQCP4229F
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur ring-1 ring-white/20 flex items-center justify-center text-white">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            TAN Number
                          </p>
                          <p className="text-xs text-white/80 font-mono">
                            LKNP13723D
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-wrap gap-3">
                      {certificates.map((cert, i) => (
                        <a
                          key={cert.name}
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => {
                            e.preventDefault();
                            setCertIndex(i);
                            window.open(cert.link, '_blank');
                          }}
                          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all shadow-lg hover:shadow-xl ${i === certIndex ? 'bg-white text-primary-600 hover:bg-white/90' : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'}`}
                        >
                          {cert.name}
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter/CTA Section */}
      <section
        id="contribute"
        className="bg-primary-500 text-white section-padding"
      >
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="heading-2 mb-4">Join Our Mission</h2>
          <p className="text-lg sm:text-xl text-white leading-relaxed mb-8">
            Your contribution, however modest, significantly impacts a student's
            journey. Join us in empowering the next generation through the gift
            of education.
          </p>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-primary-500"
              href="https://wa.me/918142238633?text=Hi,%20I%20would%20like%20to%20contribute."
            >
              Become a Contributor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
