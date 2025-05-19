import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Label, TextInput, Button, Spinner, Textarea } from "flowbite-react";
import CreatableSelect from "react-select/creatable";
import { capitalizeLabel } from "@/utils/commonFUnction";

interface Props {
  isView?: boolean;
  inputSchema: any;
  onSubmit: (
    values: Record<string, any>,
    formikHelpers: { setSubmitting: (isSubmitting: boolean) => void }
  ) => void;
}

const noOnlySpaces = (fieldName: string) =>
  Yup.string()
    .trim()
    .test(
      "not-only-spaces",
      `${capitalizeLabel(fieldName)} cannot be empty or only spaces`,
      (value) => value && value.trim().length > 0
    )
    .required(`${capitalizeLabel(fieldName)} is required`);

const DynamicForm: React.FC<Props> = ({ inputSchema, onSubmit, isView }) => {
  const initialValues: Record<string, any> = {};
  const validationShape: Record<string, any> = {};

  Object.entries(inputSchema).forEach(([key, value]) => {
    initialValues[key] = value;

    if (Array.isArray(value)) {
      validationShape[key] = Yup.array()
        .of(Yup.string())
        .min(1, `${capitalizeLabel(key)} must have at least one item`)
        .required(`${capitalizeLabel(key)} is required`);
    } else {
      validationShape[key] = noOnlySpaces(key);
    }
  });

  const validationSchema = Yup.object().shape(validationShape);

  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "transparent",
      borderColor: "rgb(75 85 99)",
    }),
    valueContainer: (base: any) => ({
      ...base,
      maxHeight: "80px",
      overflow: "auto",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "rgb(17 24 39)",
      color: "white",
    }),
    option: (base: any, state: { isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isFocused ? "rgb(55 65 81)" : "transparent",
      color: "white",
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "rgb(55 65 81)",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "white",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "white",
      ":hover": {
        backgroundColor: "rgb(220 38 38)",
        color: "white",
      },
    }),
  };

  const projectDescKey = Object.keys(inputSchema).find((key) =>
    key.toLowerCase().includes("projectdescription") ||
    key.toLowerCase().includes("project_description") ||
    key.toLowerCase().includes("project description")
  );

  const otherFields = Object.entries(inputSchema).filter(
    ([key]) => key !== projectDescKey
  );

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, formikHelpers) => onSubmit(values, formikHelpers)}
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form className="space-y-4  border border-gray-600 rounded-lg p-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {otherFields.map(([key, value]) => (
                <div key={key}>
                  <div className="col-span-1 mb-2">
                    <Label htmlFor={key} value={`${capitalizeLabel(key)}*`} />
                  </div>
                  {Array.isArray(value) ? (
                    <CreatableSelect
                      isMulti
                      styles={customStyles}
                      value={(values[key] || []).map((v: string) => ({
                        label: v,
                        value: v,
                      }))}
                      onChange={(selected) =>
                        setFieldValue(
                          key,
                          selected.map((opt: any) => opt.value)
                        )
                      }
                      isDisabled={isView}
                      className="form-control"
                    />
                  ) : (
                    <Field
                      as={TextInput}
                      id={key}
                      name={key}
                      type="text"
                      className="form-control"
                      disabled={isView}
                      color={
                        errors[key] && touched[key] ? "failure" : "gray"
                      }
                    />
                  )}
                  {errors[key] && touched[key] && (
                    <div className="text-red-500 text-sm mt-1">
                      {typeof errors[key] === "string"
                        ? errors[key]
                        : Array.isArray(errors[key])
                        ? errors[key].join(", ")
                        : JSON.stringify(errors[key])}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {projectDescKey && (
              <div className="col-span-2 mt-6">
                <div className="mb-2">
                  <Label
                    htmlFor={projectDescKey}
                    value={`${capitalizeLabel(projectDescKey)}*`}
                  />
                </div>
                <Field
                  as={Textarea}
                  id={projectDescKey}
                  name={projectDescKey}
                  className="form-control w-full"
                  disabled={isView}
                  rows={4}
                />
                {errors[projectDescKey] && touched[projectDescKey] && (
                  <div className="text-red-500 text-sm mt-1">
                    {typeof errors[projectDescKey] === "string"
                      ? errors[projectDescKey]
                      : JSON.stringify(errors[projectDescKey])}
                  </div>
                )}
              </div>
            )}

           <Button type="submit" disabled={isSubmitting || isView} color="primary">
              {isSubmitting ? (
                <>
                  <Spinner
                    size="sm"
                    aria-label="Info spinner example"
                    light
                  ></Spinner>
                  <span>Submitting...</span>
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DynamicForm;
