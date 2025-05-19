"use client";

import 'react-phone-input-2/lib/style.css'
import * as Yup from "yup";

import { Button, Label,TextInput, Textarea, Spinner } from "flowbite-react";
import { Field, Form, Formik, useFormikContext } from "formik";
import React, { useEffect, useMemo, useState } from "react";

import PhoneInput from 'react-phone-input-2'
import TitleCard from "@/app/components/shared/TitleBorderCard";
import api from "@/utils/axios";
import { useHandleApiResponse } from "@/utils/useHandleApiResponse";
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/toast/ToastManager";
import { useClientStore } from "@/stores/clientStore";
import Loader from "@/app/components/Loader";


const noOnlySpaces = (fieldName) =>
	Yup.string()
		.trim()
		.test(
			'not-only-spaces',
			`${fieldName} cannot be empty or only spaces`,
			(value) => value && value.trim().length > 0
	);


const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/\S*)?$/;	
const ClientSchema = Yup.object().shape({
	name: noOnlySpaces("Name")
		.required("Please enter your name")
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must not exceed 50 characters"),
	emailAddress: Yup.string()
		.trim()
		.lowercase()
		.email("Please enter a valid email address")
		.required("Please enter your email address")
		.max(100, "Email must not exceed 100 characters"),
	mobile: noOnlySpaces("Mobile number")
		.required("Please enter your mobile number")
		.matches(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
	companyName: noOnlySpaces("Company name")
		.required("Please enter your company name")
		.min(2, "Company name must be at least 2 characters")
		.max(100, "Company name must not exceed 100 characters"),
	description: noOnlySpaces("Description")
		.required("Please enter a description")
		.min(10, "Description must be at least 10 characters")
		.max(500, "Description must not exceed 500 characters"),
	website: Yup.string()
		.trim()
		.url("Please enter a valid website URL")
		.required("Please enter your website URL")
		.matches(urlRegex, 'Invalid website URL')
		.max(200, "Website URL must not exceed 200 characters")
		.test(
			'not-only-spaces',
			"Website URL cannot be empty or only spaces",
			(value) => value && value.trim().length > 0
		),
	addressLine1: noOnlySpaces("Address Line 1")
		.required("Please enter your address line 1")
		.min(5, "Address line 1 must be at least 5 characters")
		.max(100, "Address line 1 must not exceed 100 characters"),
	addressLine2: noOnlySpaces("Address Line 2")
		.min(5, "Address line 2 must be at least 5 characters")
		.max(100, "Address line 2 must not exceed 100 characters"),
	state: noOnlySpaces("State")
		.required("Please enter your state")
		.min(2, "State must be at least 2 characters")
		.max(50, "State must not exceed 50 characters"),
	city: noOnlySpaces("City")
		.required("Please enter your city")
		.min(2, "City must be at least 2 characters")
		.max(50, "City must not exceed 50 characters"),
	zip: noOnlySpaces("ZIP code")
		.required("Please enter your ZIP code")
		.matches(/^[a-zA-Z0-9\s\-]{3,12}$/, 'Invalid ZIP or postal code')
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
	id?: any;
}

const ClientForm: React.FC<ClientFormProps> = ({ id }) => {
	const { canCreate, canUpdate } = usePermissions();
	const router = useRouter();
	const { handleApiResponse } = useHandleApiResponse();
	const { showToast } = useToast();
	const [loading, setLoading] = useState(false);
	const [pageLoading, setPageLoading] = useState(false);
	const [editData, setEditData] = useState<EditDataType | null>(null);
	const { setUpdatedNewData } = useClientStore();

	useEffect(() => {
		const fetchEditData = async () => {
			if (id) {
				setPageLoading(true);
				try {
					const payload = {
						body: {
							id: id,
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
	}, [id]);


const PhoneInputField: React.FC = () => {
  const { values, setFieldValue, errors, touched }: any = useFormikContext<any>();

  return (
    <div className="col-span-1">
      <div className="col-span-3 mb-2">
        <Label htmlFor="mobile" value="Business Phone Number" />
      </div>
      <div className="col-span-9">
        <PhoneInput
          country={"us"}
          value={values.mobile}
          onChange={(value: string) => setFieldValue("mobile", value)}
          inputProps={{
            name: "mobile",
            required: true,
            placeholder: "Enter your business phone number",
          }}
          inputClass="!w-full !form-control !h-[2.625rem] !rounded-md"
          buttonClass="!border !border-gray-300"
          containerClass="!w-full"
          enableSearch={true}
          searchPlaceholder="Search for your country..."
          searchNotFound="No country found. Please try again."
          preferredCountries={['us', 'gb', 'ca', 'au']}
          enableAreaCodes={true}
          disableCountryCode={false}
          enableAreaCodeStretch={true}
          countryCodeEditable={true}
          autoFormat={true}
          disableDropdown={false}
        />
        {touched.mobile && errors.mobile && (
          <span className="text-red-500 text-sm mt-1">{errors.mobile}</span>
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
						validateOnChange={true}
						validateOnBlur={true}
						validateOnMount={false}
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
										...(id && { id }), // include id for edit
									},
								};

								const response = await api.post(
									id
										? "/client/updateClientProfile"
										: "/admin/createClientProfile",
									payload
								);

								// Handle success
								handleApiResponse(response);
								setUpdatedNewData(true)
								if (
									response?.data?.statusCode === 201 ||
									response?.data?.statusCode === 200
								) {
									router.push("/");
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
								<TitleCard title="Client Form">
									<div className="col-span-12 pb-6">
										<h6 className="text-lg">Contact Information</h6>
									</div>
									<div className="grid lg:grid-cols-2 gap-6 pb-6">
										<div className="col-span-1">
											<div className="col-span-3 mb-2">
												<Label htmlFor="name" value="Full Name" />
											</div>
											<div className="col-span-9">
												<Field name="name">
													{({ field }: any) => (
														<TextInput
															{...field}
															id="name"
															type="name"
															autoComplete="off"
															placeholder="Enter your full name (e.g., John Smith)"
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
															placeholder="Enter your email address (e.g., john.smith@company.com)"
															sizing="md"
															className="form-control"
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
										<h6 className="text-lg">Company Information</h6>
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
															placeholder="Enter your company's full name (e.g., ABC Corporation)"
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
												<Label htmlFor="description" value="Company Description" />
											</div>
											<div className="col-span-9">
												<Field name="description">
													{({ field }: any) => (
														<TextInput
															{...field}
															id="description"
															type="text"
															placeholder="Briefly describe your company and its services"
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
												<Label htmlFor="website" value="Company Website" />
											</div>
											<div className="col-span-9">
												<Field name="website">
													{({ field }: any) => (
														<TextInput
															{...field}
															id="website"
															type="text"
															placeholder="Enter your company website (e.g., https://www.company.com)"
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
										<h6 className="text-lg">Company Location</h6>
									</div>
									<div className="grid grid-cols-12 gap-6 pb-6">
										{[
											{ 
												name: "addressLine1", 
												label: "Street Address", 
												placeholder: "Enter your street address (e.g., 123 Main St)" 
											},
											{ 
												name: "addressLine2", 
												label: "Apartment, Suite, etc.", 
												placeholder: "Enter additional address details (optional)" 
											},
											{ 
												name: "state", 
												label: "State/Province", 
												placeholder: "Enter your state or province" 
											},
											{ 
												name: "city", 
												label: "City", 
												placeholder: "Enter your city" 
											},
											{ 
												name: "zip", 
												label: "Postal/ZIP Code", 
												placeholder: "Enter your postal or ZIP code" 
											},
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
														<span className="text-red-500 text-sm mt-1">{errors[name]}</span>
													)}
												</div>
											</div>
										))}
									</div>
								{canUpdate('client') || canCreate('client') ? (
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
								) :  null}
								</TitleCard>
							</Form>
						)}
					</Formik>
				</>
			)}
		</div>
	);
};

export default ClientForm;
