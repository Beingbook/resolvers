import { appendErrors, transformToNestObject } from 'react-hook-form';
import { StructError, validate } from 'superstruct';
// @ts-expect-error maybe fixed after the first publish ?
import { convertArrayToPathName } from '@hookform/resolvers';
import { Resolver } from './types';

const parseErrorSchema = (
  error: StructError,
  validateAllFieldCriteria: boolean,
) =>
  error
    .failures()
    .reduce((previous: Record<string, any>, { path, message = '', type }) => {
      const currentPath = convertArrayToPathName(path);
      return {
        ...previous,
        ...(path
          ? previous[currentPath] && validateAllFieldCriteria
            ? {
                [currentPath]: appendErrors(
                  currentPath,
                  validateAllFieldCriteria,
                  previous,
                  type || '',
                  message,
                ),
              }
            : {
                [currentPath]: previous[currentPath] || {
                  message,
                  type,
                  ...(validateAllFieldCriteria
                    ? {
                        types: { [type || '']: message || true },
                      }
                    : {}),
                },
              }
          : {}),
      };
    }, {});

export const superstructResolver: Resolver = (schema, options) => async (
  values,
  _context,
  validateAllFieldCriteria = false,
) => {
  const [errors, result] = validate(values, schema, options);

  if (errors != null) {
    return {
      values: {},
      errors: transformToNestObject(
        parseErrorSchema(errors, validateAllFieldCriteria),
      ),
    };
  }

  return {
    values: result,
    errors: {},
  };
};
