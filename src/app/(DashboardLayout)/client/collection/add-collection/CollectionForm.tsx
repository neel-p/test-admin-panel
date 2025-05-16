"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */

import * as Yup from "yup";

import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import TitleCard from "@/app/components/shared/TitleBorderCard";
import api from "@/utils/axios";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { useToast } from "@/app/components/toast/ToastManager";

const noOnlySpaces = (fieldName) =>
	Yup.string()
		.trim()
		.test(
			'not-only-spaces',
			`${fieldName} cannot be empty or only spaces`,
			(value) => value && value.trim().length > 0
	);


const ClientSchema = Yup.object().shape({
  name: noOnlySpaces("Name").required("Name is required"),
  description: noOnlySpaces("Description").required("Description is required"),
});

interface UserFormValues {
  name: string;
  description: string;
}

interface EditDataType {
  id: number;
  isDeleted: boolean;
  name: string;
  description: string;
}

interface UserFormProps {
  searchParams?: number;
}

const CollectionForm: React.FC<UserFormProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams?.get("data");
  const { handleApiResponse } = useHandleApiResponse();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [editData, setEditData] = useState<EditDataType | null>(null);

  const decodedData = useMemo(() => {
    if (clientId) {
      try {
        const jsonStr = Buffer.from(clientId, "base64").toString();
        return JSON.parse(jsonStr);
      } catch (err) {
        console.error("Failed to decode", err);
      }
    }
    return null;
  }, [clientId]);

  useEffect(() => {
    const fetchEditData = async () => {
      if (decodedData?.isEdit === true) {
        setPageLoading(true);
        try {
          const payload = {
            body: {
              id: parseInt(decodedData?.collectionId),
            },
          };
          const response = await api.post(
            "/collection/getClientCollection",
            payload
          );

          setEditData(response?.data?.data);
          setPageLoading(false);
        } catch (error) {
          setPageLoading(false);
          console.error("Failed to fetch edit data:", error);
        } finally {
          setPageLoading(false);
        }
      }
    };
    fetchEditData();
  }, [decodedData]);

  return (
    <div>
      {pageLoading && (
        <div className="text-center">
          <Spinner
            size="xl"
            aria-label="Center-aligned spinner example"
            light
          />
        </div>
      )}
      {!pageLoading && (
        <>
          <Formik<UserFormValues>
            enableReinitialize={true}
            initialValues={{
              name: editData?.name || "",
              description: editData?.description || "",
            }}
            validationSchema={ClientSchema}
            onSubmit={async (values: any, { setSubmitting }) => {
              setLoading(true);
              try {
                const payload = {
                  body: {
                    ...values,
                    clientId: Number(decodedData?.clientId),
                    ...(decodedData?.isEdit && {
                      id: decodedData?.collectionId,
                    }),
                  },
                };
                const response = await api.post(
                  decodedData?.isEdit
                    ? "/collection/updateClientCollection"
                    : "/collection/createClientCollection",
                  payload
                );

                // Handle success
                handleApiResponse(response);
                if (
                  response?.data?.statusCode === 201 ||
                  response?.data?.statusCode === 200
                ) {
                  router.push(`/client/collection`);
                }
              } catch (error: any) {
                const message =
                  error?.response?.data?.message || "Network error";
                showToast(message, "error");
              } finally {
                setLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="mt-6" noValidate>
                <TitleCard title="Collections Form">
                  <div className="col-span-12 pb-6">
                    <h6 className="text-lg">Collections Form</h6>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-6 pb-6">
                    <div className="col-span-1">
                      <div className="col-span-1 mb-2">
                        <Label htmlFor="name" value="Name" />
                      </div>
                      <div className="col-span-1">
                        <Field name="name">
                          {({ field }: any) => (
                            <TextInput
                              {...field}
                              id="name"
                              type="name"
                              autoComplete="off"
                              placeholder="john deo"
                              className="form-control"
                            />
                          )}
                        </Field>
                        {touched.name && errors.name && (
                          <span className="text-red-500">{errors.name}</span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <div className="col-span-1 mb-2">
                        <Label htmlFor="description" value="Description" />
                      </div>
                      <div className="col-span-1">
                        <Field name="description">
                          {({ field }: any) => (
                            <TextInput
                              {...field}
                              id="description"
                              type="description"
                              autoComplete="off"
                              placeholder="john deo"
                              className="form-control"
                            />
                          )}
                        </Field>
                        {touched.description && errors.description && (
                          <span className="text-red-500">
                            {errors.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-9 flex items-center gap-[1rem]">
                      <Button
                        type="submit"
                        color="primary"
                        disabled={isSubmitting || loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              size="sm"
                              aria-label="Info spinner example"
                              light
                            ></Spinner>
                            <span >Submitting...</span>
                          </>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                      <Button
                        type="reset"
                        color="error"
                        disabled={isSubmitting || loading}
                        onClick={() => {
                          router.back();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </TitleCard>
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};

export default CollectionForm;
