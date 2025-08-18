import React, { useState, useEffect } from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import YouTubeEmbed from '../components/ui/YouTubeEmbed';
import type { Testimonial } from '../types';

// Import data
import testimonialsData from '../data/testimonials.json';

// Import images
import testimonialsHeroBg from '../assets/images/testimonials-hero-bg.png';

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('All');

  const roles = ['All', 'Student', 'Parent', 'Mentor', 'Contributor'];

  useEffect(() => {
    const typedTestimonials = testimonialsData as Testimonial[];
    setTestimonials(typedTestimonials);
    setFilteredTestimonials(typedTestimonials);
  }, []);

  useEffect(() => {
    if (selectedRole === 'All') {
      setFilteredTestimonials(testimonials);
    } else {
      setFilteredTestimonials(
        testimonials.filter(testimonial => testimonial.role === selectedRole)
      );
    }
  }, [testimonials, selectedRole]);

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
  };

  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="Voices of Change"
        subtitle="Hear directly from our community about how education transforms lives and creates lasting impact."
        backgroundImage={testimonialsHeroBg}
        overlay={true}
      />

      {/* Filters */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Filter by Role</h2>
              <p className="text-gray-600">See testimonials from different members of our community</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleFilter(role)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedRole === role
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredTestimonials.length} testimonials
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          {filteredTestimonials.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No testimonials found</h3>
              <p className="text-gray-500">Try selecting a different role filter.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filteredTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className="p-6">
                  {/* Video or Text Testimonial */}
                  {testimonial.youtubeId ? (
                    <div className="mb-6">
                      <YouTubeEmbed
                        videoId={testimonial.youtubeId}
                        title={`${testimonial.name} - ${testimonial.role}`}
                        thumbnail={testimonial.thumbnail}
                        lazyLoad={true}
                      />
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="bg-primary-50 p-6 rounded-lg">
                        <svg className="w-8 h-8 text-primary-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                        </svg>
                        <blockquote className="text-lg text-gray-700 italic leading-relaxed">
                          "{testimonial.quote}"
                        </blockquote>
                      </div>
                    </div>
                  )}

                  {/* Testimonial Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {testimonial.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          testimonial.role === 'Student' ? 'bg-blue-100 text-blue-800' :
                          testimonial.role === 'Parent' ? 'bg-green-100 text-green-800' :
                          testimonial.role === 'Mentor' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {testimonial.role}
                        </span>
                        <span className="text-sm text-gray-500">
                          {testimonial.location}
                        </span>
                      </div>
                      
                      {/* Show quote for video testimonials */}
                      {testimonial.youtubeId && testimonial.quote && (
                        <p className="text-gray-600 text-sm italic mt-3">
                          "{testimonial.quote}"
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="heading-2 mb-4">Be Part of Their Story</h2>
          <p className="body-large mb-8">
            Every student's success story starts with someone who believes in their potential. 
            Your support can help write the next chapter of transformation.
          </p>
          
          <div className="flex justify-center">
            <a
              href="https://wa.me/918142238633?text=Hi,%20I%20would%20like%20to%20contribute."
              className="btn-secondary"
            >
              Support a Student
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Testimonials;