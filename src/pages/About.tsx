import React from 'react';
import Hero from '../components/ui/Hero';
import Card from '../components/ui/Card';
import { FaGraduationCap, FaBullseye, FaSeedling, FaGem, FaEnvelope, FaPhone } from 'react-icons/fa';
import Button from '../components/ui/Button';

// Import images
import aboutHeroBg from '../assets/images/about-hero-bg.png';

const About: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="About CLSI"
        subtitle="Empowering underprivileged students through education since 2022."
        backgroundImage={aboutHeroBg}
        overlay={true}
      />

      {/* About Section */}
      <section className="bg-white section-padding">
        <div className="max-w-6xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-6">About CLSI</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforming lives through education since 2022
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="body-large text-gray-700 leading-relaxed mb-6">
                Perhit Siksha (now CLSI) is a not-for-profit forum dedicated to transforming the lives of deserving underprivileged children through education. We operate mainly in Uttar Pradesh, Uttarakhand, and Andhra Pradesh.
              </p>
              <p className="body-large text-gray-700 leading-relaxed">
                We provide direct financial support to families while preserving their dignity, removing barriers in their quest for quality education.
              </p>
            </div>
            <div className="bg-primary-50 p-8 rounded-xl">
              <h4 className="text-lg font-semibold text-primary-900 mb-4">Impact at a Glance</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Students Supported:</span>
                  <span className="font-bold text-primary-600">200+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Contributors:</span>
                  <span className="font-bold text-primary-600">400+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">States Covered:</span>
                  <span className="font-bold text-primary-600">3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Accountability</h4>
              <p className="text-gray-700">
                Our working model ensures accountability, credibility, transparency and visible impact through rigorous monitoring.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Mentorship</h4>
              <p className="text-gray-700">
                Beyond financial aid, we provide dedicated mentorship and guidance to help students succeed academically.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">Connection</h4>
              <p className="text-gray-700">
                We build lasting connections between contributors and students, keeping supporters informed of progress.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="heading-2 mb-6">Vision</h2>
              <p className="body-large text-gray-700 leading-relaxed">
                To empower every underprivileged child by providing opportunities to complete at least intermediate-level education, nurturing academic potential and thereby paving the way for a brighter future.
              </p>
            </div>
            <div>
              <h2 className="heading-2 mb-6">Mission</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="body-large text-gray-700">
                    To provide financial aid for education of underprivileged deserving students in a dignified manner without intermediaries.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="body-large text-gray-700">
                    To mentor, guide and provide support to children academically and emotionally through the course of their educational journey.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="body-large text-gray-700">
                    To build a transparent, trustworthy and reliable platform driven by collective trust of the Contributors.
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="body-large text-gray-700">
                    To identify and enable promising children from underprivileged backgrounds to rise beyond their socio-economic limitations, through the instrument of education.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Values</h2>
            <p className="body-large">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <FaGraduationCap className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Education First
              </h3>
              <p className="body-base text-gray-700">
                We believe education is the most powerful tool for social transformation and personal empowerment.
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <FaBullseye className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Merit & Need
              </h3>
              <p className="body-base text-gray-700">
                We support students based on both academic merit and financial need, ensuring sustainable impact.
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <FaSeedling className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Holistic Support
              </h3>
              <p className="body-base text-gray-700">
                Beyond financial aid, we provide mentorship, career guidance, and personal development.
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <FaGem className="text-2xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Transparency
              </h3>
              <p className="body-base text-gray-700">
                We maintain complete transparency in our operations and fund utilization.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Our Journey</h2>
            <p className="body-large text-gray-600">
              Key milestones in our mission to democratize education
            </p>
          </div>

          <div className="relative">
            {/* Timeline line - vertical for both mobile and desktop */}
            <div className="absolute left-8 md:left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-300 via-primary-500 to-primary-600"></div>
            
            <div className="space-y-8">
              {/* 2022 - Foundation */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full shadow-lg flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2022</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">Foundation</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      CLSI was established with a vision to transform lives through education and create lasting impact in communities.
                    </p>
                  </Card>
                </div>
              </div>
              
              {/* 2023 - First Milestone */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full shadow-lg flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2023</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-primary-400">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">50 Students</h3>
                      <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Milestone</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Reached our first major milestone of supporting 50 deserving students, establishing our foundation for growth.
                    </p>
                  </Card>
                </div>
              </div>
              
              {/* 2024 - Expansion */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full shadow-lg flex-shrink-0">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2024</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-400">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">100 Students</h3>
                      <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Growth</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Doubled our impact by supporting 100 students across multiple states, expanding our geographical reach.
                    </p>
                  </Card>
                </div>
              </div>
              
              {/* 2025 - Future Vision */}
              <div className="relative flex items-start">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full shadow-xl flex-shrink-0 ring-4 ring-primary-200">
                  <div className="text-center">
                    <div className="text-sm md:text-base font-bold">2025</div>
                  </div>
                </div>
                <div className="ml-6 md:ml-8 flex-1">
                  <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-400 bg-gradient-to-br from-white to-purple-50">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <h3 className="text-xl font-bold text-gray-900">200+ Students</h3>
                      <span className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Vision</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Significantly expanding our reach to support over 200 students while enhancing our mentorship programs and community impact.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
            
            {/* Timeline end indicator */}
            <div className="relative flex items-start mt-8">
              <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-primary-300 rounded-full shadow-sm flex-shrink-0 ml-4 md:ml-6">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="ml-6 md:ml-8 flex-1">
                <p className="text-sm text-gray-500 italic">Our journey continues...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="bg-white section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Our Team</h2>
            <p className="body-large">
              Dedicated individuals working towards educational equity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mb-4 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">SR</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Sanjay Rathi</h3>
              <p className="text-primary-500 font-medium mb-2">Founder</p>
              <p className="text-sm text-gray-600">Visionary leader driving educational transformation</p>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mb-4 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">JP</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Jitendra Patel</h3>
              <p className="text-primary-500 font-medium mb-2">Program Director</p>
              <p className="text-sm text-gray-600">Coordinating student support programs</p>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mb-4 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-xl font-bold text-white">PMA</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Priya Manu Arora</h3>
              <p className="text-primary-500 font-medium mb-2">Program Director</p>
              <p className="text-sm text-gray-600">Managing educational initiatives</p>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mb-4 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">AS</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Akansha Srivastav</h3>
              <p className="text-primary-500 font-medium mb-2">Community Outreach</p>
              <p className="text-sm text-gray-600">Building community connections</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="heading-2 mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join us in transforming lives through education. Every contribution creates ripples of change that last generations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              href="https://wa.me/918142238633?text=Hi,%20I%20would%20like%20to%20contribute."
              className="text-primary-500 border-white hover:bg-white"
            >
              Become a Contributor
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              href="/testimonials"
              className="text-white border-white hover:bg-white hover:text-primary-500"
            >
              See Impact Stories
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gray-50 section-padding">
        <div className="max-w-4xl mx-auto container-padding">
          <div className="text-center mb-8">
            <h2 className="heading-2 mb-4">Get in Touch</h2>
            <p className="body-large">
              Have questions about our work or want to get involved? We'd love to hear from you.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="space-y-4">
              <div className="flex items-center">
                <FaEnvelope className="w-5 h-5 text-primary-500 mr-3" />
                <a href="mailto:clsi.perhitsiksha@gmail.com" className="text-gray-700 hover:text-primary-500 transition-colors duration-200">
                  clsi.perhitsiksha@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <FaPhone className="w-5 h-5 text-primary-500 mr-3" />
                <a href="https://wa.me/918142238633?text=Hi,%20I%20would%20like%20to%20contribute." className="text-gray-700 hover:text-primary-500 transition-colors duration-200">
                  +91 81422 38633
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;