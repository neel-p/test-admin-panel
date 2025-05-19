"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import 'react-phone-input-2/lib/style.css'

import * as Yup from "yup";

import { Button, Label, Spinner, TextInput, Textarea } from "flowbite-react";
import { Field, Form, Formik, useFormikContext } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PhoneInput from 'react-phone-input-2'
import TitleCard from "@/app/components/shared/TitleBorderCard";
import api from "@/utils/axios";
import { getDecryptedData } from "@/utils/secureStorage";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { useToast } from "@/app/components/toast/ToastManager";
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
	name: noOnlySpaces("Name").required("Name is required"),
	emailAddress: Yup.string()
		.trim()
		.lowercase()
		.email("Invalid email")
		.required("Email is required"),
	mobile: noOnlySpaces("Mobile").required("Mobile is required"),
	companyName: noOnlySpaces("Company Name").required("Company name is required"),
	description: noOnlySpaces("Description").required("Description is required"),
	website: noOnlySpaces("Website").url("Invalid URL").required("Website is required"),
	addressLine1: noOnlySpaces("Address Line 1").required("Address Line 1 is required"),
	addressLine2: noOnlySpaces("Address Line 2"),
	state: noOnlySpaces("State").required("State is required"),
	city: noOnlySpaces("City").required("City is required"),
	zip: noOnlySpaces("Zip").required("ZIP is required"),
});

interface ClientFormValues {
	name: string;
	emailAddress: string;
	mobile: string | number;
	companyName: string;
	description: string;
	website: string;
	addressLine1: string;
	addressLine2: string;
	state: string;
	city: string;
	zip: string;
}

interface ClientDetails {
	website: string;
	companyName: string;
	companyAddress: string;
	description: string;
	addressLine1: string;
	addressLine2: string;
	state: string;
	city: string;
	zip: string;
}

interface ClientContacts {
	emailAddress: string;
	name: string;
	mobile: string | number;
}

interface EditDataType {
	id: number;
	clientDetails: ClientDetails;
	clientContacts: ClientContacts;
	isDeleted: boolean;
}
interface ClientFormProps {
	id?: number;
}

const ProfileForm: React.FC<ClientFormProps> = () => {
    const localData = getDecryptedData("user", "cookie");{{}}
	const router = useRouter();
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
							id: localData?.id,
						},
					};

					const response = await api.post("/client/getClientProfile", payload);
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
	}, [localData?.id]);


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
          }}
		  disabled={true}
          inputClass="!w-full !form-control !h-[2.625rem] !rounded-md "
          buttonClass="!border !border-gray-300"
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
					<Formik<ClientFormValues>
						enableReinitialize={true}
						initialValues={{
							emailAddress: editData?.clientContacts?.emailAddress || "",
							name: editData?.clientContacts?.name || "",
							mobile: editData?.clientContacts?.mobile || "",
							companyName: editData?.clientDetails?.companyName || "",
							description: editData?.clientDetails?.description || "",
							website: editData?.clientDetails?.website || "",
							addressLine1: editData?.clientDetails?.addressLine1 || "",
							addressLine2: editData?.clientDetails?.addressLine2 || "",
							state: editData?.clientDetails?.state || "",
							city: editData?.clientDetails?.city || "",
							zip: editData?.clientDetails?.zip || "",
						}}
						validationSchema={ClientSchema}
						onSubmit={async (values: any, { setSubmitting }) => {
							setLoading(true);
							try {
								const payload = {
									body: {
										clientDetails: {
											companyName: values.companyName,
											description: values.description,
											website: values.website,
											addressLine1: values.addressLine1,
											addressLine2: values.addressLine2,
											state: values.state,
											city: values.city,
											zip: values.zip,
										},
										clientContacts: {
											name: values.name,
											emailAddress: values.emailAddress,
											mobile: values.mobile,
										},
                                        id: localData?.id,
									},
								};

								const response = await api.post("/client/updateClientProfile",
									payload
								);

								// Handle success
								handleApiResponse(response);
								if (
									response?.data?.statusCode === 201 ||
									response?.data?.statusCode === 200
								) {
									router.push("/client/user");
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
						{({ errors, touched, isSubmitting, }) => (
							<Form className="mt-6" noValidate>
								<TitleCard title="Profile">
									<div className="col-span-12 pb-6">
										<h6 className="text-lg">Contacts</h6>
									</div>
									<div className="grid lg:grid-cols-2 gap-6 pb-6">
										<div className="col-span-1">
											<div className="col-span-3 mb-2">
												<Label htmlFor="name" value="Username" />
											</div>
											<div className="col-span-9">
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
											<div className="col-span-3 mb-2">
												<Label htmlFor="emailAddress" value="Email Address" />
											</div>
											<div className="col-span-9">
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
										<PhoneInputField />
									</div>

									<div className="col-span-12 pb-6 border-t border-border pt-5 dark:border-darkborder">
										<h6 className="text-lg"> Details</h6>
									</div>

									<div className="grid grid-cols-12 gap-6 pb-6">
										<div className="lg:col-span-6 col-span-12">
											<div className="col-span-3 mb-2">
												<Label htmlFor="companyName" value="Company Name" />
											</div>
											<div className="col-span-9">
												<Field name="companyName">
													{({ field }: any) => (
														<TextInput
															{...field}
															id="companyName"
															type="text"
															placeholder="xyz"
															sizing="md"
															className="form-control"
														/>
													)}
												</Field>
												{touched.companyName && errors.companyName && (
													<span className="text-red-500">
														{errors.companyName}
													</span>
												)}
											</div>
										</div>
										<div className="lg:col-span-6 col-span-12">
											<div className="col-span-3 mb-2">
												<Label htmlFor="description" value="Description" />
											</div>
											<div className="col-span-9">
												<Field name="description">
													{({ field }: any) => (
														<TextInput
															{...field}
															id="description"
															type="text"
															placeholder="Powell"
															sizing="md"
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

										<div className="lg:col-span-6 col-span-12">
											<div className="col-span-3 mb-2">
												<Label htmlFor="website" value="Website" />
											</div>
											<div className="col-span-9">
												<Field name="website">
													{({ field }: any) => (
														<TextInput
															{...field}
															id="website"
															type="text"
															placeholder="www.xyz.com"
															sizing="md"
															className="form-control"
														/>
													)}
												</Field>
												{touched.website && errors.website && (
													<span className="text-red-500">{errors.website}</span>
												)}
											</div>
										</div>
									</div>

									<div className="col-span-12 pb-6 border-t border-border pt-5 dark:border-darkborder">
										<h6 className="text-lg">Company Address</h6>
									</div>
									<div className="grid grid-cols-12 gap-6 pb-6">
										{[
											{ name: "addressLine1", label: "Address Line 1", placeholder: "123 Main St" },
											{ name: "addressLine2", label: "Address Line 2", placeholder: "Apt, Suite, etc." },
											{ name: "state", label: "State", placeholder: "California" },
											{ name: "city", label: "City", placeholder: "Los Angeles" },
											{ name: "zip", label: "ZIP Code", placeholder: "90001" },
										].map(({ name, label, placeholder }) => (
											<div key={name} className="lg:col-span-6 col-span-12">
												<div className="col-span-3 mb-2">
													<Label htmlFor={name} value={label} />
												</div>
												<div className="col-span-9">
													<Field name={name}>
														{({ field }: any) => (
															<TextInput
																{...field}
																id={name}
																type="text"
																placeholder={placeholder}
																className="form-control"
															/>
														)}
													</Field>
													{touched[name] && errors[name] && (
														<span className="text-red-500">{errors[name]}</span>
													)}
												</div>
											</div>
										))}
									</div>

									<div className="grid grid-cols-2">
										<div className="col-span-3"></div>
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

export default ProfileForm;
