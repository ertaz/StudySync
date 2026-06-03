import { useState } from "react";

import {
  exportAssignments,
  importAssignments,
} from "../../services/assignmentService";

export default function DataTools() {
  const [file, setFile] =
    useState<File | null>(
      null
    );

  const handleExport =
    async (
      format:
        | "csv"
        | "excel"
        | "json"
    ) => {

      try {
        const blob =
          await exportAssignments(
            format
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `assignments.${format}`;

        link.click();

      } catch (err) {
        console.error(err);
      }
    };

  const handleImport =
    async () => {

      if (!file) return;

      try {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        await importAssignments(
          formData
        );

        alert(
          "Import successful"
        );

      } catch (err) {
        console.error(err);
      }
    };

  return (
    <div className="mx-auto max-w-4xl p-6">

      <h1 className="mb-8 text-3xl font-bold">
        Import / Export
      </h1>

      <div className="rounded-xl border bg-white p-8">

        <h2 className="mb-4 text-xl font-semibold">
          Export Assignments
        </h2>

        <div className="flex gap-3">

          <button
            onClick={() =>
              handleExport(
                "csv"
              )
            }
            className="rounded-lg bg-green-600 px-5 py-3 text-white"
          >
            CSV
          </button>

          <button
            onClick={() =>
              handleExport(
                "excel"
              )
            }
            className="rounded-lg bg-blue-600 px-5 py-3 text-white"
          >
            Excel
          </button>

          <button
            onClick={() =>
              handleExport(
                "json"
              )
            }
            className="rounded-lg bg-purple-600 px-5 py-3 text-white"
          >
            JSON
          </button>

        </div>

        <hr className="my-8" />

        <h2 className="mb-4 text-xl font-semibold">
          Import Assignments
        </h2>

        <input
          type="file"
          onChange={(e) =>
            setFile(
              e.target.files?.[0] ||
                null
            )
          }
        />

        <button
          onClick={
            handleImport
          }
          className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Import
        </button>

      </div>

    </div>
  );
}