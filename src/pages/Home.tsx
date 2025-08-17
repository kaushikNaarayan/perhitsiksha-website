import React, { useState, useEffect } from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatsCounter from '../components/ui/StatsCounter';
import YouTubeEmbed from '../components/ui/YouTubeEmbed';
import YouTubeShortsCarousel from '../components/ui/YouTubeShortsCarousel';
import type { Story, Testimonial } from '../types';

// Import data
import storiesData from '../data/stories.json';
import testimonialsData from '../data/testimonials.json';

// Import images
import heroBgImage from '../assets/images/hero-bg.png';

const Home: React.FC = () => {
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [featuredTestimonial, setFeaturedTestimonial] = useState<Testimonial | null>(null);

  // Celebrity endorsements data
  const celebrityEndorsements = [
    { id: '1', name: 'Priyamani', videoId: 'l4JAmumyw5k', profession: 'Actress' },
    { id: '2', name: 'Madhur Bhandarkar', videoId: 'LD5Qzq7pxwg', profession: 'Film Director' },
    { id: '3', name: 'Amala Akkineni', videoId: 'g9viUStaIUI', profession: 'Actress' },
    { id: '4', name: 'Ravi Dubey', videoId: '2WgZU1tg0gI', profession: 'Actor' },
    { id: '5', name: 'Anjum Sharma', videoId: 'pI6ZTT17-QA', profession: 'Actor' },
    { id: '6', name: 'Venkatesh Prasad', videoId: '5Ft1a0I1LHo', profession: 'Former Cricketer' },
    { id: '7', name: 'Suresh Raina', videoId: 'G3RbOb5t22E', profession: 'Cricketer' },
    { id: '8', name: 'Atul Wassan', videoId: '4Z9V_wbU5mg', profession: 'Cricket Commentator' },
    { id: '9', name: 'Pullela Gopichand', videoId: 'Bcleh93Fhbc', profession: 'Badminton Coach' }
  ];

  useEffect(() => {
    // Load featured stories
    const featured = (storiesData as Story[]).filter(story => story.featured).slice(0, 3);
    setFeaturedStories(featured);

    // Load featured testimonial with video
    const featuredTest = (testimonialsData as Testimonial[]).find(t => t.featured && t.youtubeId);
    setFeaturedTestimonial(featuredTest || null);
  }, []);

  const programs = [
    {
      id: '1',
      title: 'Financial Aid',
      description: 'Direct financial support for tuition, books, and living expenses to help students complete their education.',
      icon: '💰',
      features: [
        'Tuition fee assistance',
        'Books and supplies funding',
        'Living expense support',
        'Emergency financial aid'
      ]
    },
    {
      id: '2',
      title: 'Mentorship Program',
      description: 'One-on-one guidance from industry professionals to help students navigate their academic and career journey.',
      icon: '🎓',
      features: [
        'Industry expert mentors',
        'Career guidance sessions',
        'Skill development workshops',
        'Personal growth coaching'
      ]
    },
    {
      id: '3',
      title: 'Career Guidance',
      description: 'Comprehensive career counseling, interview preparation, and job placement assistance.',
      icon: '🚀',
      features: [
        'Career counseling',
        'Interview preparation',
        'Resume building workshops',
        'Job placement assistance'
      ]
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="Empowering Education for Every Child"
        subtitle="We provide financial aid, mentorship, and career guidance to help underprivileged students complete their education and transform their lives."
        primaryCTA={{
          text: "Support a Student",
          href: "#contribute"
        }}
        secondaryCTA={{
          text: "Watch Stories",
          href: "/testimonials"
        }}
        backgroundImage={heroBgImage}
        overlay={false}
      />

      {/* Impact Stats */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatsCounter value={300} suffix="+" label="Students Supported" />
            <StatsCounter value={500} suffix="+" label="Contributors" />
            <StatsCounter value={15} suffix="+" label="Years of Impact" />
            <StatsCounter value={95} suffix="%" label="Success Rate" />
          </div>
        </div>
      </section>

      {/* Celebrity Endorsements */}
      <section className="bg-primary-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Celebrity Endorsements</h2>
            <p className="body-large max-w-2xl mx-auto">
              Prominent personalities from sports, cinema, and media support our mission to democratize education
            </p>
          </div>
          <YouTubeShortsCarousel endorsements={celebrityEndorsements} />
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">What We Do</h2>
            <p className="body-large max-w-2xl mx-auto mb-8">
              We believe every deserving student should have access to quality education, 
              regardless of their financial background.
            </p>
            
            {/* Video Introduction */}
            <div className="max-w-2xl mx-auto">
              <YouTubeEmbed
                videoId="c1fM-oB6FVw"
                title="PerhitSiksha - Empowering Education"
                lazyLoad={true}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <Card key={program.id} className="p-6 text-center">
                <div className="text-4xl mb-4">{program.icon}</div>
                <h3 className="heading-3 mb-3">{program.title}</h3>
                <p className="body-base mb-4">{program.description}</p>
                <ul className="text-sm text-gray-600 space-y-1 mb-6">
                  {program.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="heading-2 mb-4">Success Stories</h2>
              <p className="body-large">
                Real stories of transformation and hope from our community.
              </p>
            </div>
            <Button href="/stories" variant="outline">
              View All Stories
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredStories.map((story) => (
              <Card key={story.id} className="hover-lift">
                {story.image && (
                  <div className="aspect-4-3 bg-gray-200">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                      {story.category}
                    </span>
                    <span className="text-sm text-gray-500 ml-auto">
                      {new Date(story.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {story.excerpt}
                  </p>
                  <Button variant="outline" size="sm">
                    Read More
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Video Testimonial */}
      {featuredTestimonial && (
        <section className="bg-primary-50 section-padding">
          <div className="max-w-4xl mx-auto container-padding text-center">
            <h2 className="heading-2 mb-4">Voices of Change</h2>
            <p className="body-large mb-8">
              Hear directly from our community about the impact of education.
            </p>
            
            <div className="max-w-2xl mx-auto mb-6">
              <YouTubeEmbed
                videoId={featuredTestimonial.youtubeId!}
                title={`${featuredTestimonial.name} - ${featuredTestimonial.role}`}
                lazyLoad={true}
              />
            </div>
            
            <div className="text-center">
              <blockquote className="text-lg italic text-gray-700 mb-4">
                "{featuredTestimonial.quote}"
              </blockquote>
              <div className="text-sm text-gray-600">
                <strong>{featuredTestimonial.name}</strong> • {featuredTestimonial.role} • {featuredTestimonial.location}
              </div>
            </div>
            
            <div className="mt-8">
              <Button href="/testimonials" variant="primary">
                See All Testimonials
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter/CTA Section */}
      <section id="contribute" className="bg-primary-500 text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="heading-2 mb-4">Join Our Mission</h2>
          <p className="body-large mb-8">
            Every contribution, no matter how small, makes a difference in a student's life. 
            Help us empower the next generation through education.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button variant="secondary" size="lg">
              Donate Now
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary-500">
              Become a Mentor
            </Button>
          </div>

          {/* Newsletter Signup */}
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <Button variant="secondary" size="md">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;