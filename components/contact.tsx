'use client'

import { useEffect, useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';

import { FaArrowRight, FaFacebook, FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSectionInView } from '@/lib/hooks';

type FormValues = {
  email: string;
  subject: string;
  message: string;
  website: string;
};

type ClientErrors = {
  email?: string;
  subject?: string;
  message?: string;
  form?: string;
};

const SPAM_KEYWORDS = [
  'buy now',
  'free money',
  'investment offer',
  'casino',
  'crypto signal',
  'loan offer',
  'click here',
];

const RATE_LIMIT_MS = 60_000;
const RATE_LIMIT_STORAGE_KEY = 'contact_last_submitted_at';

const LOW_QUALITY_MESSAGES = [
  'hi',
  'hello',
  'test',
  'testing',
  'ok',
  'okay',
  'good day',
  'how are you',
];

function containsSpam(text: string): boolean {
  const normalized = text.toLowerCase();
  const hasUrl = /(https?:\/\/|www\.|bit\.ly|t\.me)/i.test(normalized);
  const hasKeyword = SPAM_KEYWORDS.some((word) => normalized.includes(word));
  const tooManyRepeats = /(.)\1{6,}/.test(normalized);
  return hasUrl || hasKeyword || tooManyRepeats;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function isLowQualityText(text: string): boolean {
  const normalized = normalizeText(text).toLowerCase();
  if (!normalized) {
    return true;
  }

  if (LOW_QUALITY_MESSAGES.includes(normalized)) {
    return true;
  }

  const words = normalized.split(' ').filter(Boolean);
  const uniqueWords = new Set(words);

  if (words.length < 4) {
    return true;
  }

  if (uniqueWords.size <= 2 && words.length >= 4) {
    return true;
  }

  return false;
}


function Contact() {
  const [state, handleSubmit] = useForm("xjkbzdye");
  const [isHovered, setIsHovered] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [values, setValues] = useState<FormValues>({
    email: '',
    subject: '',
    message: '',
    website: '',
  });
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});
  const cooldownRemainingMs = lastSubmittedAt
    ? Math.max(0, RATE_LIMIT_MS - (now - lastSubmittedAt))
    : 0;
  const cooldownRemainingSec = Math.ceil(cooldownRemainingMs / 1000);

  const { ref } = useSectionInView("Contact");

  useEffect(() => {
    const stored = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!stored) {
      return;
    }

    const parsed = Number(stored);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setLastSubmittedAt(parsed);
      setNow(Date.now());
    }
  }, []);

  useEffect(() => {
    if (cooldownRemainingMs <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 500);

    return () => {
      window.clearInterval(timerId);
    };
  }, [cooldownRemainingMs]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const validateForm = (): ClientErrors => {
    const nextErrors: ClientErrors = {};
    const email = normalizeText(values.email);
    const subject = normalizeText(values.subject);
    const message = values.message.trim();

    if (values.website.trim().length > 0) {
      nextErrors.form = 'Spam detected.';
      return nextErrors;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (subject.length < 5 || subject.length > 80) {
      nextErrors.subject = 'Subject must be 5 to 80 characters.';
    } else if (isLowQualityText(subject)) {
      nextErrors.subject = 'Subject is too generic. Make it more specific.';
    } else if (containsSpam(subject)) {
      nextErrors.subject = 'Subject looks like spam. Please rewrite it.';
    }

    if (message.length < 20 || message.length > 1000) {
      nextErrors.message = 'Message must be 20 to 1000 characters.';
    } else if (isLowQualityText(message)) {
      nextErrors.message = 'Please provide a more detailed and meaningful message.';
    } else if (containsSpam(message)) {
      nextErrors.message = 'Message looks like spam. Please rewrite it.';
    }

    return nextErrors;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (cooldownRemainingMs > 0) {
      setClientErrors({
        form: `Please wait ${cooldownRemainingSec}s before sending another message.`,
      });
      return;
    }

    const nextErrors = validateForm();
    setClientErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await handleSubmit(event);
    const submittedAt = Date.now();
    setLastSubmittedAt(submittedAt);
    setNow(submittedAt);
    window.localStorage.setItem(RATE_LIMIT_STORAGE_KEY, String(submittedAt));
    setValues({
      email: '',
      subject: '',
      message: '',
      website: '',
    });
    setClientErrors({});
  };


  return (
  <footer
  ref={ref} 
  id='contact'
  >
    <div className='my-20 pb-20 flex items-center justify-center'>
      <div className='flex flex-col w-full max-w-[700px]'>
        <motion.h2 
        className='text-5xl font-bold text-center my-8'
        initial={{ x: 300, opacity: 0}}
        whileInView={{ x: 0, opacity: 1}}
        transition={{ ease: "easeInOut", duration: 2}}
        viewport={{
          once: true,
        }}
        >
          Don&apos;t Hesitate to <span className="bg-clip-text text-transparent bg-yellow-200">
            Reach Out
          </span>
        </motion.h2>

           <form onSubmit={onSubmit} noValidate>
             <input
             type="text"
             name="website"
             autoComplete="off"
             tabIndex={-1}
             className='hidden'
             value={values.website}
             onChange={(e) => setValues((prev) => ({ ...prev, website: e.target.value }))}
             />
             <motion.div 
             className='grid grid-cols-1 sm:grid-cols-2 gap-4'
             initial={{ y: 100, opacity: 0}}
             whileInView={{ y: 0, opacity: 1}}
             transition={{ ease: "easeInOut", duration: 2}}
             viewport={{
              once: true,
             }}
             >
                 <div>
            <input
             id="email"
             type="email" 
             name="email"
             placeholder='Email'
             required
             maxLength={120}
             value={values.email}
             onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
             className='border-2 w-full bg-transparent rounded-lg p-2 focus:outline-none 
             focus:border-white-200'
             />
            {clientErrors.email && <p className='text-red-400 text-sm mt-1'>{clientErrors.email}</p>}
            <ValidationError 
             prefix="Email" 
             field="email"
             errors={state.errors}
             />
           </div>
           <div>
            <input
             id="subject"
             type="subject" 
             name="subject"
             placeholder='Subject'
             required
             maxLength={80}
             value={values.subject}
             onChange={(e) => setValues((prev) => ({ ...prev, subject: e.target.value }))}
             className='border-2 w-full bg-transparent rounded-lg p-2 focus:outline-none 
             focus:border-white-200'
             />
            {clientErrors.subject && <p className='text-red-400 text-sm mt-1'>{clientErrors.subject}</p>}
            <ValidationError 
             prefix="subject" 
             field="subject"
             errors={state.errors}
             />
           </div>
      </motion.div>
      <motion.div 
      className='mt-4'
      initial={{ y: 100, opacity: 0}}
      whileInView={{ y: 0, opacity: 1}}
      transition={{ ease: "easeInOut", duration: 2}}
      viewport={{
      once: true,
      }}
      >         
       <textarea
           id="message"
           name="message"
           placeholder='Message'
           required
           maxLength={1000}
             value={values.message}
             onChange={(e) => setValues((prev) => ({ ...prev, message: e.target.value }))}
           className='bg-transparent border-2 rounded-lg w-full my-2 min-h-[100px] p-2 focus:outline-none 
           focus:border-white-200'
           />
           {clientErrors.message && <p className='text-red-400 text-sm mt-1'>{clientErrors.message}</p>}
       <ValidationError 
           prefix="Message" 
           field="message"
           errors={state.errors}
           />
  </motion.div>

            {clientErrors.form && <p className='text-red-400 text-sm mt-2'>{clientErrors.form}</p>}
            {cooldownRemainingMs > 0 && (
              <p className='text-yellow-300 text-sm mt-2'>
                Rate limit active: wait {cooldownRemainingSec}s before next submit.
              </p>
            )}

          <motion.div 
          className="mt-5 relative"
          initial={{ x: -300, opacity: 0}}
          whileInView={{ x: 0, opacity: 1}}
          transition={{ ease: "easeInOut", duration: 2}}
          viewport={{
            once: true,
          }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }} // Scale animation on hover
              className={`p-2 rounded-full border border-white/50 max-w-[170px] px-12 transition-all duration-300 flex items-center justify-center overflow-hidden hover:border-accent group ${isHovered ? 'icon-only' : ''}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              type="submit"
              disabled={state.submitting || state.succeeded || cooldownRemainingMs > 0}
              >
              {isHovered ? (
                <FaArrowRight className='h-6 w-8 ' color='yellow'/>
              ) : (
                "Submit"
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
    <div className='flex mt-16 md:flex-row flex-col justify-between items-center'>
        <p className='md:text-base mb-1 md:mb-0 text-sm md:font-normal font-light'>
          Copyright © 2024 Joshua
        </p>
        <div className='mb-2 flex items-center md:gap-3 gap-6'>
        <Link className='w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300' href='https://www.linkedin.com/in/joshua-paul-de-guzman/' passHref>
            <FaLinkedin className='text-2xl hover:color-blue-700 transition-colors duration-300' />
        </Link>
        <Link className='w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300' href='https://github.com/Joshupau' passHref>
            <FaGithub className='text-2xl hover:text-lightyellow transition-colors duration-300' />
        </Link>
        <Link className='w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300' href='https://www.facebook.com/WangWangJoshu/' passHref>
            <FaFacebook className='text-2xl hover:text-lightyellow transition-colors duration-300' />
        </Link>
        </div>
    </div>
  </footer>
  );
}

export default Contact;