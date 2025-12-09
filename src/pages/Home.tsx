import React, { useState, useEffect } from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import YouTubeEmbed from '../components/ui/YouTubeEmbed';
import YouTubeShortsCarousel from '../components/ui/YouTubeShortsCarousel';
import PeekCarousel from '../components/ui/PeekCarousel';
import type { Testimonial } from '../types';

// Import data
import testimonialsData from '../data/testimonials.json';

// Import images
import heroBgImage from '../assets/images/hero-bg.png';

const Home: React.FC = () => {
  const [voicesTestimonials, setVoicesTestimonials] = useState<Testimonial[]>(
    []
  );

  // Celebrity endorsements data for carousel
  const celebrityEndorsements = [
    {
      id: '1',
      name: 'Priyamani',
      videoId: 'l4JAmumyw5k',
      profession: 'Actress',
    },
    {
      id: '2',
      name: 'Madhur Bhandarkar',
      videoId: 'LD5Qzq7pxwg',
      profession: 'Film Director',
    },
    {
      id: '3',
      name: 'Amala Akkineni',
      videoId: 'g9viUStaIUI',
      profession: 'Actress',
    },
    {
      id: '4',
      name: 'Ravi Dubey',
      videoId: '2WgZU1tg0gI',
      profession: 'Actor',
    },
    {
      id: '5',
      name: 'Anjum Sharma',
      videoId: 'pI6ZTT17-QA',
      profession: 'Actor',
    },
    {
      id: '6',
      name: 'Venkatesh Prasad',
      videoId: '5Ft1a0I1LHo',
      profession: 'Former Cricketer',
    },
    {
      id: '7',
      name: 'Suresh Raina',
      videoId: 'G3RbOb5t22E',
      profession: 'Cricketer',
    },
    {
      id: '8',
      name: 'Atul Wassan',
      videoId: '4Z9V_wbU5mg',
      profession: 'Cricket Commentator',
    },
    {
      id: '9',
      name: 'Pullela Gopichand',
      videoId: '9Cw2TarHBM8',
      profession: 'Badminton Coach',
    },
    {
      id: '10',
      name: 'VVS Laxman',
      videoId: 'dEWv_0c-omo',
      profession: 'Cricketer',
    },
    {
      id: '11',
      name: 'Kidambi Srikanth',
      videoId: 'Z3ps_cG0UjM',
      profession: 'Badminton Star',
    },
    {
      id: '12',
      name: 'Mohammad Azharuddin',
      videoId: 'RAxeVaOgKW0',
      profession: 'Cricketer',
    },
    {
      id: '13',
      name: 'Sania Mirza',
      videoId: 'jzkOt0RYJLI',
      profession: 'Tennis Player',
    },
    {
      id: '14',
      name: 'Saina Nehwal',
      videoId: 'uH5t-gXKhzc',
      profession: 'Badminton Player',
    },
    {
      id: '15',
      name: 'Satwiksairaj Rankireddy',
      videoId: 'U4fnK-_HCXw',
      profession: 'Badminton Player',
    },
  ];

  useEffect(() => {
    // Load student testimonials for Voices of Change carousel
    const studentTestimonials = (testimonialsData as Testimonial[]).filter(
      t => t.role === 'Student' && t.youtubeId
    );
    setVoicesTestimonials(studentTestimonials);
  }, []);

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
        subtitle="Empowering underprivileged students through financial aid, mentorship, and career guidance to complete their education and transform their lives."
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
                title="PerhitSiksha - What We Do"
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
