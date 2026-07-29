-- SUPABASE SEED DATA (LEXEDU E-LEARNING PLATFORM)
-- All demo records marked with is_demo = true

-- Categories
INSERT INTO public.categories (id, name, slug, description, sort_order, status, is_demo) VALUES
('c1000000-0000-0000-0000-000000000001', 'ChatGPT', 'chatgpt', 'Các khóa học làm chủ ChatGPT từ cơ bản đến chuyên sâu', 1, 'ACTIVE', true),
('c1000000-0000-0000-0000-000000000002', 'Gemini', 'gemini', 'Ứng dụng Google Gemini trong phân tích, lập trình và sáng tạo', 2, 'ACTIVE', true),
('c1000000-0000-0000-0000-000000000003', 'AI Căn Bản', 'ai-can-ban', 'Kiến thức nền tảng về Trí tuệ nhân tạo dành cho người mới', 3, 'ACTIVE', true),
('c1000000-0000-0000-0000-000000000004', 'AI Nâng Cao', 'ai-nang-cao', 'Kỹ thuật Prompt Engineering nâng cao và tự động hóa quy trình', 4, 'ACTIVE', true),
('c1000000-0000-0000-0000-000000000005', 'AI Tạo Hình Ảnh', 'ai-tao-hinh-anh', 'Sáng tạo hình ảnh với Midjourney, Flux và Stable Diffusion', 5, 'ACTIVE', true),
('c1000000-0000-0000-0000-000000000006', 'AI Tạo Video', 'ai-tao-video', 'Làm video, kịch bản và diễn viên ảo bằng AI', 6, 'ACTIVE', true),
('c1000000-0000-0000-0000-000000000007', 'AI Cho Công Việc', 'ai-cho-cong-viec', 'Tăng gấp 5 lần hiệu suất văn phòng và sáng tạo nội dung', 7, 'ACTIVE', true)
ON CONFLICT (slug) DO NOTHING;

-- Course 1: Làm quen với ChatGPT
INSERT INTO public.courses (
  id, category_id, title, slug, short_description, description, thumbnail_url,
  instructor_name, level, estimated_duration, enrollment_type, status, is_featured,
  learning_outcomes, target_audience, requirements, is_demo
) VALUES (
  'd1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'Làm quen với ChatGPT',
  'lam-quen-voi-chatgpt',
  'Khóa học nhập môn giúp bạn khai phá sức mạnh của ChatGPT trong công việc và học tập.',
  'Khóa học bao gồm lý thuyết cơ bản và các bài thực hành thực tế, hướng dẫn viết prompt chuẩn, áp dụng vào soạn thảo email, tóm tắt tài liệu và phân tích dữ liệu.',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  'Chuyên gia LexEdu',
  'BEGINNER',
  120,
  'OPEN',
  'PUBLISHED',
  true,
  '["Hiểu rõ nguyên lý hoạt động của ChatGPT","Biết cách cấu trúc một Prompt hiệu quả","Ứng dụng vào công việc văn phòng hằng ngày"]'::jsonb,
  '["Người mới bắt đầu tìm hiểu về AI","Nhân viên văn phòng, sinh viên, giáo viên"]'::jsonb,
  '["Máy tính hoặc điện thoại có kết nối Internet"]'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Course 1 Sections
INSERT INTO public.course_sections (id, course_id, title, description, sort_order, status, is_demo) VALUES
('s1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Chương 1: Tổng quan về ChatGPT', 'Giới thiệu về giao diện và nguyên lý hoạt động', 1, 'PUBLISHED', true),
('s1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'Chương 2: Cách viết prompt cơ bản', 'Cấu trúc câu lệnh và các vai trò chuẩn', 2, 'PUBLISHED', true),
('s1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Chương 3: Ứng dụng trong công việc', 'Soạn email, viết báo cáo và lập kế hoạch', 3, 'PUBLISHED', true),
('s1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'Chương 4: Lỗi thường gặp', 'Khắc phục hiện tượng suy đoán sai và tối ưu câu trả lời', 4, 'PUBLISHED', true)
ON CONFLICT DO NOTHING;

-- Course 1 Lessons
INSERT INTO public.lessons (id, section_id, title, slug, lesson_type, text_content, video_url, estimated_duration, sort_order, is_preview, status, is_demo) VALUES
('l1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'Bài 1: Giới thiệu ChatGPT và OpenAI', 'bai-1-gioi-thieu-chatgpt', 'TEXT', '<p>Chào mừng bạn đến với khóa học <strong>Làm quen với ChatGPT</strong>. Trong bài học này, chúng ta sẽ tìm hiểu lịch sử phát triển của Mô hình ngôn ngữ lớn (LLM) và cách truy cập ChatGPT trên web và di động.</p>', NULL, 15, 1, true, 'PUBLISHED', true),
('l1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'Bài 2: Hướng dẫn giao diện và các cài đặt chính', 'bai-2-huong-dan-giao-dien', 'VIDEO', NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 20, 2, false, 'PUBLISHED', true),
('l1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000002', 'Bài 3: Cấu trúc Prompt 4 thành phần chuẩn', 'bai-3-cau-truc-prompt', 'TEXT', '<p>Một Prompt chất lượng gồm 4 thành phần: <strong>Context (Bối cảnh)</strong>, <strong>Task (Nhiệm vụ)</strong>, <strong>Instruction (Chỉ dẫn cụ thể)</strong>, và <strong>Format (Định dạng đầu ra)</strong>.</p>', NULL, 25, 1, false, 'PUBLISHED', true)
ON CONFLICT DO NOTHING;

-- Course 2: Gemini nâng cao cho công việc
INSERT INTO public.courses (
  id, category_id, title, slug, short_description, description, thumbnail_url,
  instructor_name, level, estimated_duration, enrollment_type, status, is_featured,
  learning_outcomes, target_audience, requirements, is_demo
) VALUES (
  'd1000000-0000-0000-0000-000000000002',
  'c1000000-0000-0000-0000-000000000002',
  'Gemini nâng cao cho công việc',
  'gemini-nang-cao-cho-cong-viec',
  'Chuyên sâu về mô hình đa thức của Google Gemini trong lập trình, phân tích dữ liệu và tích hợp hệ thống.',
  'Khóa học dành cho học viên cần xử lý khối lượng dữ liệu khổng lồ với Context Window dài vượt trội của Gemini 1.5 & 2.0 Pro.',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  'Senior AI Architect',
  'ADVANCED',
  240,
  'ADMIN_ASSIGNED',
  'PUBLISHED',
  true,
  '["Khai thác cửa sổ ngữ cảnh 1M-2M tokens","Phân tích tài liệu PDF và video dài bằng Gemini","Tích hợp Gemini API trong dự án doanh nghiệp"]'::jsonb,
  '["Lập trình viên, Data Analyst, Manager"]'::jsonb,
  '["Đã nắm vững kiến thức cơ bản về AI"]'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Course 3: Sử dụng AI để tạo hình ảnh
INSERT INTO public.courses (
  id, category_id, title, slug, short_description, description, thumbnail_url,
  instructor_name, level, estimated_duration, enrollment_type, status, is_featured,
  learning_outcomes, target_audience, requirements, is_demo
) VALUES (
  'd1000000-0000-0000-0000-000000000003',
  'c1000000-0000-0000-0000-000000000003',
  'Sử dụng AI để tạo hình ảnh',
  'su-dung-ai-de-tao-hinh-anh',
  'Kỹ thuật tạo banner, logo, thiết kế và nghệ thuật số với công cụ AI thế hệ mới.',
  'Hướng dẫn từng bước cách phối hợp phong cách nghệ thuật, ánh sáng, góc máy và bố cục để tạo ra tác phẩm chuyên nghiệp.',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80',
  'Creative Director',
  'INTERMEDIATE',
  180,
  'APPROVAL_REQUIRED',
  'PUBLISHED',
  true,
  '["Làm chủ các lệnh tạo ảnh và negative prompt","Tự làm banner truyền thông và hình minh họa","Ứng dụng AI vào thiết kế đồ họa"]'::jsonb,
  '["Graphic Designer, Marketer, Content Creator"]'::jsonb,
  '["Có niềm đam mê sáng tạo hình ảnh"]'::jsonb,
  true
) ON CONFLICT (slug) DO NOTHING;
