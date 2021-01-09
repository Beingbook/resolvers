import React from 'react';
import { render, screen, act } from '@testing-library/react';
import user from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '..';

const schema = Yup.object({
  username: Yup.string().required(),
  password: Yup.string().required(),
});

type FormData = Yup.InferType<typeof schema> & { unusedProperty: string };

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const { register, errors, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(schema), // Useful to check TypeScript regressions
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="username" ref={register} />
      {errors.username && <span role="alert">{errors.username.message}</span>}

      <input name="password" ref={register} />
      {errors.password && <span role="alert">{errors.password.message}</span>}

      <button type="submit">submit</button>
    </form>
  );
}

test("form's validation with Yup and TypeScript's integration", async () => {
  const handleSubmit = jest.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  expect(screen.queryAllByRole(/alert/i)).toHaveLength(0);

  await act(async () => {
    user.click(screen.getByText(/submit/i));
  });

  expect(screen.getByText(/username is a required field/i)).toBeInTheDocument();
  expect(screen.getByText(/password is a required field/i)).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
});
