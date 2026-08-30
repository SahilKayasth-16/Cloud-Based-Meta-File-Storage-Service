package com.cloudmeta.storage.service.storage;

import java.io.InputStream;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudmeta.storage.exception.StorageException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

@Slf4j
@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "s3", matchIfMissing = false)
@RequiredArgsConstructor
public class S3StorageServiceImpl implements StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Override
    public String uploadFile(MultipartFile file, String storageKey) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("Successfully uploaded file to S3 bucket: {}, key: {}", bucketName, storageKey);
            return storageKey;
        } catch (S3Exception e) {
            log.error("S3 error uploading file key: {}", storageKey, e);
            throw new StorageException("Failed to upload file to Object Storage: " + e.awsErrorDetails().errorMessage(), e);
        } catch (Exception e) {
            log.error("Error uploading file key: {}", storageKey, e);
            throw new StorageException("Failed to upload file to Object Storage: " + e.getMessage(), e);
        }
    }

    @Override
    public InputStream getFileInputStream(String storageKey) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .build();

            return s3Client.getObject(getObjectRequest);
        } catch (S3Exception e) {
            log.error("S3 error retrieving file key: {}", storageKey, e);
            throw new StorageException("Failed to retrieve file from Object Storage: " + e.awsErrorDetails().errorMessage(), e);
        } catch (Exception e) {
            log.error("Error retrieving file key: {}", storageKey, e);
            throw new StorageException("Failed to retrieve file from Object Storage: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String storageKey) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("Successfully deleted file from S3 bucket: {}, key: {}", bucketName, storageKey);
        } catch (S3Exception e) {
            log.error("S3 error deleting file key: {}", storageKey, e);
            throw new StorageException("Failed to delete file from Object Storage: " + e.awsErrorDetails().errorMessage(), e);
        } catch (Exception e) {
            log.error("Error deleting file key: {}", storageKey, e);
            throw new StorageException("Failed to delete file from Object Storage: " + e.getMessage(), e);
        }
    }

    @Override
    public String generateSignedDownloadUrl(String storageKey, int expirationSeconds) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(expirationSeconds))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            log.info("Generated presigned GET URL for key: {}", storageKey);
            return presignedRequest.url().toString();
        } catch (Exception e) {
            log.error("Error generating presigned GET URL for key: {}", storageKey, e);
            throw new StorageException("Failed to generate download URL: " + e.getMessage(), e);
        }
    }
}
