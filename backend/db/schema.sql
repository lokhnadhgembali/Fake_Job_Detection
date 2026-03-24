
-- Creating and using the database
CREATE DATABASE fake_job_detection_db;
USE fake_job_detection_db;

 -- Table for user
CREATE TABLE user (
	user_id INT auto_increment primary key,
	username varchar(50) not null,
	password_hash varchar(255) not null,
	role varchar(10) not null,
	email varchar(100) not null
);

 -- Table for job post submission
CREATE TABLE jobpostsubmission (
post_id int auto_increment primary key,
user_id int not null,
job_text text not null,
company_name varchar(255),
location varchar(255),
submission_time timestamp not null,
foreign key (user_id) references user(user_id)
);

 -- Table for prediction result
CREATE TABLE predictionresult (
prediction_id int auto_increment primary key,
post_id int not null,
label varchar(10) not null,
confidence_score float not null,
model_version varchar(50) not null,
predicted_time timestamp not null,
foreign key (post_id) references jobpostsubmission(post_id)
-- foreign key (model_version) references modelversion(model_version)
);

 -- Table for flagged post
CREATE TABLE flaggedpost (
flag_id int auto_increment primary key,
post_id int not null,
reason text,
flagged_time timestamp not null,
reviewed_by int,
foreign key (post_id) references jobpostsubmission(post_id),
foreign key (reviewed_by) references user(user_id)
);

-- Table for model version 
CREATE TABLE modelversion (
model_id int auto_increment primary key,
version_tag varchar(50) not null,
training_date timestamp not null,
accuracy float not null,
f1_score float not null,
comments text
);

-- Table for retained log
CREATE TABLE retainedlog (
retained_id int auto_increment primary key,
model_id int not null,
retrained_by int not null,
retrain_time timestamp not null,
notes text,
foreign key (model_id) references modelversion(model_id),
foreign key (retrained_by) references user(user_id)
);

-- Table for system log
CREATE table systemlog (
log_id int auto_increment primary key,
user_id int not null,
action_type varchar(50) not null,
description text not null,
timestamp timestamp not null,
foreign key (user_id) references user (user_id)
);