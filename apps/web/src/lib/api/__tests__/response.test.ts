/**
 * Unit Tests for API Response Helpers
 */

import { NextResponse } from 'next/server';
import {
  jsonResponse,
  errorResponse,
  apiErrorResponse,
  successResponse,
  createdResponse,
  noContentResponse,
} from '../response';
import { APIError, ValidationError } from '../errors';

describe('API Response Helpers', () => {
  describe('jsonResponse', () => {
    it('should create JSON response with default status', () => {
      const data = { message: 'test' };
      const response = jsonResponse(data);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    it('should create JSON response with custom status', () => {
      const data = { message: 'created' };
      const response = jsonResponse(data, 201);

      expect(response.status).toBe(201);
    });
  });

  describe('errorResponse', () => {
    it('should create error response with default status', () => {
      const response = errorResponse('Something went wrong');

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
    });

    it('should create error response with custom status', () => {
      const response = errorResponse('Not found', 404);

      expect(response.status).toBe(404);
    });

    it('should include details when provided', () => {
      const details = { field: 'email' };
      const response = errorResponse('Invalid', 400, details);

      expect(response.status).toBe(400);
    });
  });

  describe('apiErrorResponse', () => {
    it('should create response from APIError', () => {
      const error = new APIError('Test error', 400, 'TEST_ERROR');
      const response = apiErrorResponse(error);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
    });

    it('should include error details', () => {
      const details = { errors: ['field1', 'field2'] };
      const error = new ValidationError('Invalid input', details);
      const response = apiErrorResponse(error);

      expect(response.status).toBe(400);
    });
  });

  describe('successResponse', () => {
    it('should create success response with data', () => {
      const data = { id: '123', name: 'Test' };
      const response = successResponse(data);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    it('should include message when provided', () => {
      const data = { id: '123' };
      const response = successResponse(data, 'Operation successful');

      expect(response.status).toBe(200);
    });
  });

  describe('createdResponse', () => {
    it('should create 201 response with data', () => {
      const data = { id: '123', name: 'New Item' };
      const response = createdResponse(data);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(201);
    });

    it('should include message when provided', () => {
      const data = { id: '123' };
      const response = createdResponse(data, 'Created successfully');

      expect(response.status).toBe(201);
    });
  });

  describe('noContentResponse', () => {
    it('should create 204 response with no body', () => {
      const response = noContentResponse();

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(204);
    });
  });
});
