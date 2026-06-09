import { useState } from 'react';

import {
  submitFeedback,
} from '../../api/courseFeedbackApi';

interface Props {
  courseId: number;
}

export default function CourseFeedbackForm({
  courseId,
}: Props) {

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState('');

  const [error, setError] =
    useState('');

    const [submitted, setSubmitted] =
  useState(false);


  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError('');
    setSuccess('');

    if (comment.trim().length < 10) {
      setError(
        'Please write at least 10 characters.'
      );
      return;
    }

    try {

      setLoading(true);

      await submitFeedback(
        courseId,
        rating,
        comment
      );
      
      setSuccess(
        'Thank you for your feedback.'
      );
      
      setComment('');
      setRating(5);
      setSubmitted(true);

    } catch (err: any) {

      setError(
        err?.response?.data?.message ||
        'Failed to submit feedback.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-stroke bg-white dark:bg-boxdark dark:border-strokedark p-5">

<h2 className="text-base font-semibold text-black dark:text-white mb-4">
  Course Feedback
</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

<div>
  <label className="block text-xs font-medium text-gray-500 mb-2">
    Your Rating
  </label>

  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={submitted}
        onClick={() => setRating(star)}
        className="text-xl transition transform hover:scale-110 disabled:opacity-40"
      >
        {star <= rating ? '⭐' : '☆'}
      </button>
    ))}
  </div>
</div>

        

<div>
  <label className="block text-xs font-medium text-gray-500 mb-2">
    Comment
  </label>

  <textarea
    rows={3}
    disabled={submitted}
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    className="
      w-full
      rounded-lg
      border border-stroke
      dark:border-strokedark
      bg-transparent
      px-3 py-2
      text-sm
      focus:outline-none focus:ring-1 focus:ring-blue-500
      resize-none
    "
    placeholder="Share your experience..."
  />
</div>

{error && (
  <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
    {error}
  </div>
)}

{success && (
  <div className="text-xs text-green-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
    {success}
  </div>
)}

<button
  disabled={loading || submitted}
  className="
    w-full
    !bg-blue-600
    hover:!bg-blue-700
    text-white
    text-sm
    font-medium
    py-2.5
    rounded-lg
    transition
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
>
  {submitted
    ? '✓ Submitted'
    : loading
    ? 'Submitting...'
    : 'Submit Feedback'}
</button>
        
            <p className="text-xs text-gray-500 text-center mt-2">
  ℹ️ Only one feedback submission is allowed per course.
</p> 

      </form>
    </div>
  );
}