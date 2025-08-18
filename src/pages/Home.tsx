import React, { useState, useEffect } from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
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

  // Celebrity endorsements data for carousel
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
      description: 'Direct financial support for tuition, books, and living expenses to help students complete their education.'
    },
    {
      id: '2',
      title: 'Mentorship',
      description: 'One-on-one guidance from industry professionals to help students navigate their academic and career journey.'
    },
    {
      id: '3',
      title: 'Career Guidance',
      description: 'Comprehensive career counseling, interview preparation, and job placement assistance.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="Education for Every Child"
        stats={[]}
        backgroundImage={heroBgImage}
        overlay={false}
      />


      {/* Celebrity Endorsements */}
      <section className="bg-primary-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-6">
            <p className="body-large max-w-2xl mx-auto">
              Celebrities who support our mission to democratise education
            </p>
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
              We believe every deserving student should have access to quality education, 
              regardless of their financial background.
            </p>
            
            {/* Video Introduction */}
            <div className="max-w-4xl mx-auto">
              <YouTubeEmbed
                videoId="-slFir-pGh0"
                title="PerhitSiksha - Empowering Education"
                lazyLoad={true}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program) => (
              <Card key={program.id} className="p-4 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{program.title}</h3>
                <p className="text-sm text-gray-600">{program.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Success Stories</h2>
            <p className="body-large">
              Real stories of transformation and hope from our community.
            </p>
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
          
          <div className="text-center mt-8">
            <a href="/stories" className="text-primary-500 hover:text-primary-600 font-medium">
              View All Stories →
            </a>
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
          
          <div className="flex justify-center">
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary-500" href="https://wa.me/918142238633">
              Become a Contributor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;