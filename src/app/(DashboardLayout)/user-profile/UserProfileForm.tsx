"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import TitleCard from "@/app/components/shared/TitleBorderCard";
import { useToast } from "@/app/components/toast/ToastManager";
import api from "@/utils/axios";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { Field, Form, Formik, useFormikContext } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { getDecryptedData } from "@/utils/secureStorage";
import Loader from "@/app/components/Loader";

const noOnlySpaces = (fieldName) =>
	Yup.string()
		.trim()
		.test(
			'not-only-spaces',
			`${fieldName} cannot be empty or only spaces`,
			(value) => value && value.trim().length > 0
	);

const ClientSchema = Yup.object().shape({
  firstName:noOnlySpaces("First Name").required("First Name is required"),
  lastName: noOnlySpaces("First Name").required("Last Name is required"),
  emailAddress: Yup.string()
    .trim()
    .lowercase()
    .email("Invalid email")
    .required("Email is required"),
  mobile: noOnlySpaces("obile").required("Mobile is required"),
  designation: noOnlySpaces("Designation").required("Designation is required"),
});

interface UserFormValues {
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobile: string | number;
  designation: string;
}

interface EditDataType {
  id: number;
  isDeleted: boolean;
  firstName: string;
  lastName: string;
  emailAddress: string;
  mobile: string | number;
  designation: string;
}

interface UserFormProps {
  searchParams?: number;
}

const UserProfileForm: React.FC<UserFormProps> = () => {
  const router = useRouter();
  const localData = getDecryptedData("user", "cookie");{{}}
  const { handleApiResponse } = useHandleApiResponse();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [editData, setEditData] = useState<EditDataType | null>(null);

  useEffect(() => {
    const fetchEditData = async () => {
      if (localData?.id) {
        setPageLoading(true);
        try {
          const payload = {
            body: {
              id: parseInt(localData?.id),
            },
          };
          const response = await api.post("/user/getUserProfile", payload);

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
  }, []);

const PhoneInputField: React.FC = () => {
  const { values, setFieldValue, errors, touched }: any = useFormikContext<any>();

  return (
    <div className="col-span-1">
      <div className="col-span-3 mb-2">
        <Label htmlFor="mobile" value="Mobile" />
      </div>
      <div className="col-span-9">
        <PhoneInput
          country={"us"}
          value={values.mobile}
          onChange={(value: string) => setFieldValue("mobile", value)}
          inputProps={{
            name: "mobile",
            required: true,
            disabled: true
          }}
          disabled={true}
        //   disableCountryCodeDropdown={true}
          inputClass="!w-full !form-control !h-[2.625rem] !rounded-md !bg-gray-100"
          buttonClass="!border !border-gray-300 !bg-gray-100"
          containerClass="!w-full"
        />
        {touched.mobile && errors.mobile && (
          <span className="text-red-500">{errors.mobile}</span>
        )}
      </div> 
    </div>
  );
};

  return (
    <div>
      {pageLoading && (
       <Loader color="primary" />
      )}
	   {!pageLoading && (
		<>
      <Formik<UserFormValues>
        enableReinitialize={true}
        initialValues={{
          emailAddress: editData?.emailAddress || "",
          firstName: editData?.firstName || "",
          lastName: editData?.lastName || "",
          mobile: editData?.mobile || "",
          designation: editData?.designation || "",
        }}
        validationSchema={ClientSchema}
        onSubmit={async (values: any, { setSubmitting }) => {
          setLoading(true);
          try {
            const payload = {
              body: {
                ...values,
                clientId: localData?.clientId,
                id: localData?.id,
                clientAgentId: [],
              },
            };
            const response = await api.post(
             "/user/updateUserProfile",
              payload
            );

            

            // Handle success
            handleApiResponse(response);
            if ( response?.data?.statusCode === 200 ||
                response?.data?.statusCode === 201) {
              router.push(`/client/user`);
            }
          } catch (error: any) {
            console.log("error", error);
            const message = error?.response?.data?.message || "Network error";
            showToast(message, "error");
          } finally {
            setLoading(false);
            setSubmitting(false);
          }
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="mt-6" noValidate>
            <TitleCard title="User Form">
              <div className="col-span-12 pb-6">
                <h6 className="text-lg">User Details</h6>
              </div>
              <div className="grid lg:grid-cols-2 gap-6 pb-6">
                <div className="col-span-1">
                  <div className="col-span-1 mb-2">
                    <Label htmlFor="firstName" value="First Name" />
                  </div>
                  <div className="col-span-1">
                    <Field name="firstName">
                      {({ field }: any) => (
                        <TextInput
                          {...field}
                          id="firstName"
                          type="firstName"
                          autoComplete="off"
                          placeholder="john deo"
                          className="form-control"
                        />
                      )}
                    </Field>
                    {touched.firstName && errors.firstName && (
                      <span className="text-red-500">{errors.firstName}</span>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="col-span-1 mb-2">
                    <Label htmlFor="lastName" value="Last Name" />
                  </div>
                  <div className="col-span-1">
                    <Field name="lastName">
                      {({ field }: any) => (
                        <TextInput
                          {...field}
                          id="lastName"
                          type="lastName"
                          autoComplete="off"
                          placeholder="john deo"
                          className="form-control"
                        />
                      )}
                    </Field>
                    {touched.lastName && errors.lastName && (
                      <span className="text-red-500">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="col-span-1 mb-2">
                    <Label htmlFor="emailAddress" value="Email Address" />
                  </div>
                  <div className="col-span-1">
                    <Field name="emailAddress">
                      {({ field }: any) => (
                        <TextInput
                          {...field}
                          type="text"
                          placeholder="john.deo@example.com"
                          sizing="md"
                          className="form-control"
                          disabled={true}
                        />
                      )}
                    </Field>
                    {touched.emailAddress && errors.emailAddress && (
                      <span className="text-red-500">
                        {errors.emailAddress}
                      </span>
                    )}
                  </div>
                </div>

                {/* <div className="col-span-1">
                  <div className="col-span-1 mb-2">
                    <Label htmlFor="mobile" value="Mobile" />
                  </div>
                  <div className="col-span-1">
                    <Field name="mobile">
                      {({ field }: any) => (
                        <TextInput
                          {...field}
                          id="mobile"
                          type="number"
                          placeholder="12345689"
                          sizing="md"
                          className="form-control"
						   onWheel={(e) => e.currentTarget.blur()} // Disable scroll
                              onKeyDown={(e) => {
                                if (
                                  e.key === "ArrowUp" ||
                                  e.key === "ArrowDown"
                                ) {
                                  e.preventDefault(); // Disable up/down arrow keys
                                }
                            }}
                        />
                      )}
                    </Field>
                    {touched.mobile && errors.mobile && (
                      <span className="text-red-500">{errors.mobile}</span>
                    )}
                  </div>
                </div> */}

				<PhoneInputField />

                <div className="col-span-1">
                  <div className="col-span-1 mb-2">
                    <Label htmlFor="designation" value="Designation" />
                  </div>
                  <div className="col-span-1">
                    <Field name="designation">
                      {({ field }: any) => (
                        <TextInput
                          {...field}
                          id="designation"
                          type="designation"
                          autoComplete="off"
                          placeholder="john deo"
                          className="form-control"
                        />
                      )}
                    </Field>
                    {touched.designation && errors.designation && (
                      <span className="text-red-500">{errors.designation}</span>
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

export default UserProfileForm;
