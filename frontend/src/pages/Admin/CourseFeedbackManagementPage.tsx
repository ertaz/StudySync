import { useEffect, useMemo, useState } from "react";

import {
  getAllFeedback,
  markReviewed,
  deleteFeedback,
  CourseFeedback
} from "../../api/courseFeedbackApi";

export default function CourseFeedbackManagementPage() {

  const [feedback, setFeedback] =
    useState<CourseFeedback[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const loadData = async () => {
    try {

      const data =
        await getAllFeedback();

      setFeedback(data);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered =
    useMemo(() => {

      return feedback.filter((item) => {

        const course =
          item.course?.title || "";

        const student =
          item.student
            ? `${item.student.first_name} ${item.student.last_name}`
            : "";

        const comment =
          item.comment || "";

        const term =
          search.toLowerCase();

        return (
          course.toLowerCase().includes(term) ||
          student.toLowerCase().includes(term) ||
          comment.toLowerCase().includes(term)
        );
      });

    }, [feedback, search]);

  const handleReviewed =
    async (id: number) => {

      await markReviewed(id);

      setFeedback((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: "reviewed" }
            : f
        )
      );
    };

  const handleDelete =
    async (id: number) => {

      if (
        !window.confirm(
          "Delete this feedback?"
        )
      ) return;

      await deleteFeedback(id);

      setFeedback((prev) =>
        prev.filter(
          (f) => f.id !== id
        )
      );
    };

  if (loading) {
    return (
      <div className="p-6">
        Loading feedback...
      </div>
    );
  }

  return (
    <div className="p-6">
  
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Course Feedback
          </h1>
          <p className="text-sm text-gray-500">
            Manage student feedback submissions
          </p>
        </div>
  
        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search course, student or comment..."
          className="
            w-full md:w-72
            rounded-lg border border-gray-200
            dark:border-strokedark
            bg-white dark:bg-boxdark
            px-4 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />
      </div>
  
      {/* TABLE WRAPPER CARD */}
      <div className="rounded-2xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark overflow-hidden shadow-sm">
  
        <div className="overflow-x-auto">
  
          <table className="w-full text-sm">
  
            <thead className="bg-gray-50 dark:bg-meta-4 text-left">
              <tr className="text-gray-600 dark:text-gray-300">
                <th className="p-4">Course</th>
                <th className="p-4">Student</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
  
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-gray-100 dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4 transition"
                >
  
                  {/* COURSE */}
                  <td className="p-4 font-medium text-black dark:text-white">
                    {item.course?.title || '—'}
                  </td>
  
                  {/* STUDENT */}
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {item.student?.first_name} {item.student?.last_name}
                  </td>
  
                  {/* RATING */}
                  <td className="p-4 text-yellow-500 font-medium">
                    {"⭐".repeat(item.rating)}
                  </td>
  
                  {/* COMMENT */}
                  <td className="p-4 max-w-xs text-gray-600 dark:text-gray-300">
                    <p className="line-clamp-2">
                      {item.comment}
                    </p>
                  </td>
  
                  {/* STATUS */}
                  <td className="p-4">
                    {item.status === "reviewed" ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Reviewed
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Pending
                      </span>
                    )}
                  </td>
  
                  {/* ACTIONS */}
                  <td className="p-4">
                    <div className="flex gap-2">
  
                      {item.status === "pending" && (
                        <button
                          onClick={() => handleReviewed(item.id)}
                          className="
                            px-3 py-1 text-xs
                            rounded-lg
                            bg-green-600 hover:bg-green-700
                            text-white
                            transition
                          "
                        >
                          Mark Reviewed
                        </button>
                      )}
  
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="
                          px-3 py-1 text-xs
                          rounded-lg
                          bg-red-600 hover:bg-red-700
                          text-white
                          transition
                        "
                      >
                        Delete
                      </button>

                   

                    
                      
                    </div>
                  </td>
  
                </tr>
              ))}
            </tbody>
  
          </table>
  
        </div>
      </div>
    </div>
  );
}