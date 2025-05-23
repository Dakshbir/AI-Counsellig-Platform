PGDMP  5    #                }           ai_counselling    16.8    16.8 >    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16398    ai_counselling    DATABASE     �   CREATE DATABASE ai_counselling WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE ai_counselling;
                postgres    false            h           1247    16484    sessionstatus    TYPE     s   CREATE TYPE public.sessionstatus AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);
     DROP TYPE public.sessionstatus;
       public          postgres    false            e           1247    16478    sessiontype    TYPE     B   CREATE TYPE public.sessiontype AS ENUM (
    'AI',
    'HUMAN'
);
    DROP TYPE public.sessiontype;
       public          postgres    false            b           1247    16471    userrole    TYPE     U   CREATE TYPE public.userrole AS ENUM (
    'STUDENT',
    'COUNSELOR',
    'ADMIN'
);
    DROP TYPE public.userrole;
       public          postgres    false            �            1259    16441    career_roadmaps    TABLE     �   CREATE TABLE public.career_roadmaps (
    id integer NOT NULL,
    user_id integer,
    roadmap_data json,
    created_at timestamp without time zone
);
 #   DROP TABLE public.career_roadmaps;
       public         heap    postgres    false            �            1259    16440    career_roadmaps_id_seq    SEQUENCE     �   CREATE SEQUENCE public.career_roadmaps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.career_roadmaps_id_seq;
       public          postgres    false    222            �           0    0    career_roadmaps_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.career_roadmaps_id_seq OWNED BY public.career_roadmaps.id;
          public          postgres    false    221            �            1259    16494    foreign_study_roadmaps    TABLE     �   CREATE TABLE public.foreign_study_roadmaps (
    id integer NOT NULL,
    user_id integer,
    roadmap_data json,
    created_at timestamp without time zone
);
 *   DROP TABLE public.foreign_study_roadmaps;
       public         heap    postgres    false            �            1259    16493    foreign_study_roadmaps_id_seq    SEQUENCE     �   CREATE SEQUENCE public.foreign_study_roadmaps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE public.foreign_study_roadmaps_id_seq;
       public          postgres    false    226            �           0    0    foreign_study_roadmaps_id_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE public.foreign_study_roadmaps_id_seq OWNED BY public.foreign_study_roadmaps.id;
          public          postgres    false    225            �            1259    16411    psychometric_data    TABLE     %  CREATE TABLE public.psychometric_data (
    id integer NOT NULL,
    user_id integer,
    interests json,
    skills json,
    personality_type character varying,
    aptitude json,
    recommended_careers json,
    report_url character varying,
    uploaded_at timestamp without time zone
);
 %   DROP TABLE public.psychometric_data;
       public         heap    postgres    false            �            1259    16410    psychometric_data_id_seq    SEQUENCE     �   CREATE SEQUENCE public.psychometric_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.psychometric_data_id_seq;
       public          postgres    false    218            �           0    0    psychometric_data_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.psychometric_data_id_seq OWNED BY public.psychometric_data.id;
          public          postgres    false    217            �            1259    16456    session_interactions    TABLE     �   CREATE TABLE public.session_interactions (
    id integer NOT NULL,
    session_id integer,
    question text,
    answer text,
    "timestamp" timestamp without time zone
);
 (   DROP TABLE public.session_interactions;
       public         heap    postgres    false            �            1259    16455    session_interactions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.session_interactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.session_interactions_id_seq;
       public          postgres    false    224                        0    0    session_interactions_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.session_interactions_id_seq OWNED BY public.session_interactions.id;
          public          postgres    false    223            �            1259    16426    sessions    TABLE     W  CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id integer,
    session_type public.sessiontype,
    scheduled_time timestamp without time zone,
    status public.sessionstatus,
    transcript text,
    summary text,
    created_at timestamp without time zone,
    counselor_id integer,
    recording_url character varying
);
    DROP TABLE public.sessions;
       public         heap    postgres    false    869    872            �            1259    16425    sessions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.sessions_id_seq;
       public          postgres    false    220                       0    0    sessions_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;
          public          postgres    false    219            �            1259    16400    users    TABLE     �  CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying,
    hashed_password character varying,
    full_name character varying,
    grade_class character varying,
    contact character varying,
    expectations character varying,
    is_active boolean,
    created_at timestamp without time zone,
    role public.userrole DEFAULT 'STUDENT'::public.userrole NOT NULL
);
    DROP TABLE public.users;
       public         heap    postgres    false    866    866            �            1259    16399    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    216                       0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    215            @           2604    16444    career_roadmaps id    DEFAULT     x   ALTER TABLE ONLY public.career_roadmaps ALTER COLUMN id SET DEFAULT nextval('public.career_roadmaps_id_seq'::regclass);
 A   ALTER TABLE public.career_roadmaps ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    221    222    222            B           2604    16497    foreign_study_roadmaps id    DEFAULT     �   ALTER TABLE ONLY public.foreign_study_roadmaps ALTER COLUMN id SET DEFAULT nextval('public.foreign_study_roadmaps_id_seq'::regclass);
 H   ALTER TABLE public.foreign_study_roadmaps ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    226    225    226            >           2604    16414    psychometric_data id    DEFAULT     |   ALTER TABLE ONLY public.psychometric_data ALTER COLUMN id SET DEFAULT nextval('public.psychometric_data_id_seq'::regclass);
 C   ALTER TABLE public.psychometric_data ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    217    218    218            A           2604    16459    session_interactions id    DEFAULT     �   ALTER TABLE ONLY public.session_interactions ALTER COLUMN id SET DEFAULT nextval('public.session_interactions_id_seq'::regclass);
 F   ALTER TABLE public.session_interactions ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    224    223    224            ?           2604    16429    sessions id    DEFAULT     j   ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);
 :   ALTER TABLE public.sessions ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    220    219    220            <           2604    16403    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    215    216            �          0    16441    career_roadmaps 
   TABLE DATA           P   COPY public.career_roadmaps (id, user_id, roadmap_data, created_at) FROM stdin;
    public          postgres    false    222   �J       �          0    16494    foreign_study_roadmaps 
   TABLE DATA           W   COPY public.foreign_study_roadmaps (id, user_id, roadmap_data, created_at) FROM stdin;
    public          postgres    false    226   yK       �          0    16411    psychometric_data 
   TABLE DATA           �   COPY public.psychometric_data (id, user_id, interests, skills, personality_type, aptitude, recommended_careers, report_url, uploaded_at) FROM stdin;
    public          postgres    false    218   �K       �          0    16456    session_interactions 
   TABLE DATA           ]   COPY public.session_interactions (id, session_id, question, answer, "timestamp") FROM stdin;
    public          postgres    false    224   L       �          0    16426    sessions 
   TABLE DATA           �   COPY public.sessions (id, user_id, session_type, scheduled_time, status, transcript, summary, created_at, counselor_id, recording_url) FROM stdin;
    public          postgres    false    220   �L       �          0    16400    users 
   TABLE DATA           �   COPY public.users (id, email, hashed_password, full_name, grade_class, contact, expectations, is_active, created_at, role) FROM stdin;
    public          postgres    false    216   $M                  0    0    career_roadmaps_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.career_roadmaps_id_seq', 1, true);
          public          postgres    false    221                       0    0    foreign_study_roadmaps_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.foreign_study_roadmaps_id_seq', 1, false);
          public          postgres    false    225                       0    0    psychometric_data_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.psychometric_data_id_seq', 1, true);
          public          postgres    false    217                       0    0    session_interactions_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.session_interactions_id_seq', 1, false);
          public          postgres    false    223                       0    0    sessions_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.sessions_id_seq', 3, true);
          public          postgres    false    219                       0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 4, true);
          public          postgres    false    215            N           2606    16448 $   career_roadmaps career_roadmaps_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.career_roadmaps
    ADD CONSTRAINT career_roadmaps_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.career_roadmaps DROP CONSTRAINT career_roadmaps_pkey;
       public            postgres    false    222            T           2606    16501 2   foreign_study_roadmaps foreign_study_roadmaps_pkey 
   CONSTRAINT     p   ALTER TABLE ONLY public.foreign_study_roadmaps
    ADD CONSTRAINT foreign_study_roadmaps_pkey PRIMARY KEY (id);
 \   ALTER TABLE ONLY public.foreign_study_roadmaps DROP CONSTRAINT foreign_study_roadmaps_pkey;
       public            postgres    false    226            I           2606    16418 (   psychometric_data psychometric_data_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.psychometric_data
    ADD CONSTRAINT psychometric_data_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.psychometric_data DROP CONSTRAINT psychometric_data_pkey;
       public            postgres    false    218            R           2606    16463 .   session_interactions session_interactions_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.session_interactions
    ADD CONSTRAINT session_interactions_pkey PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.session_interactions DROP CONSTRAINT session_interactions_pkey;
       public            postgres    false    224            L           2606    16433    sessions sessions_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_pkey;
       public            postgres    false    220            F           2606    16407    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    216            O           1259    16454    ix_career_roadmaps_id    INDEX     O   CREATE INDEX ix_career_roadmaps_id ON public.career_roadmaps USING btree (id);
 )   DROP INDEX public.ix_career_roadmaps_id;
       public            postgres    false    222            U           1259    16507    ix_foreign_study_roadmaps_id    INDEX     ]   CREATE INDEX ix_foreign_study_roadmaps_id ON public.foreign_study_roadmaps USING btree (id);
 0   DROP INDEX public.ix_foreign_study_roadmaps_id;
       public            postgres    false    226            G           1259    16424    ix_psychometric_data_id    INDEX     S   CREATE INDEX ix_psychometric_data_id ON public.psychometric_data USING btree (id);
 +   DROP INDEX public.ix_psychometric_data_id;
       public            postgres    false    218            P           1259    16469    ix_session_interactions_id    INDEX     Y   CREATE INDEX ix_session_interactions_id ON public.session_interactions USING btree (id);
 .   DROP INDEX public.ix_session_interactions_id;
       public            postgres    false    224            J           1259    16439    ix_sessions_id    INDEX     A   CREATE INDEX ix_sessions_id ON public.sessions USING btree (id);
 "   DROP INDEX public.ix_sessions_id;
       public            postgres    false    220            C           1259    16409    ix_users_email    INDEX     H   CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);
 "   DROP INDEX public.ix_users_email;
       public            postgres    false    216            D           1259    16408    ix_users_id    INDEX     ;   CREATE INDEX ix_users_id ON public.users USING btree (id);
    DROP INDEX public.ix_users_id;
       public            postgres    false    216            Y           2606    16449 ,   career_roadmaps career_roadmaps_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.career_roadmaps
    ADD CONSTRAINT career_roadmaps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 V   ALTER TABLE ONLY public.career_roadmaps DROP CONSTRAINT career_roadmaps_user_id_fkey;
       public          postgres    false    4678    222    216            [           2606    16502 :   foreign_study_roadmaps foreign_study_roadmaps_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.foreign_study_roadmaps
    ADD CONSTRAINT foreign_study_roadmaps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 d   ALTER TABLE ONLY public.foreign_study_roadmaps DROP CONSTRAINT foreign_study_roadmaps_user_id_fkey;
       public          postgres    false    4678    216    226            V           2606    16419 0   psychometric_data psychometric_data_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.psychometric_data
    ADD CONSTRAINT psychometric_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 Z   ALTER TABLE ONLY public.psychometric_data DROP CONSTRAINT psychometric_data_user_id_fkey;
       public          postgres    false    216    4678    218            Z           2606    16464 9   session_interactions session_interactions_session_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.session_interactions
    ADD CONSTRAINT session_interactions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);
 c   ALTER TABLE ONLY public.session_interactions DROP CONSTRAINT session_interactions_session_id_fkey;
       public          postgres    false    220    224    4684            W           2606    16509 #   sessions sessions_counselor_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_counselor_id_fkey FOREIGN KEY (counselor_id) REFERENCES public.users(id);
 M   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_counselor_id_fkey;
       public          postgres    false    220    4678    216            X           2606    16434    sessions sessions_user_id_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 H   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_user_id_fkey;
       public          postgres    false    216    220    4678            �   �   x�m�A� E�1��0��b�k1!��P�*�N�{���#��\I$y�eʥ�
%�-.|`������ ���{������@p�hk�ɢ)�XC�������'`��r�����E��a��D	����C���v���zzk)��[=�      �      x������ � �      �   �   x�-�MK1���_r�m�ip�7�� �V�H6���&)�iE���D����3�)�*v�>R���W\.@rP�,bO�f�6Ɛ|��	"�t�G�9�s
Ζ���?�ط� �v=�I�ɩ`#	�q.h]�|m~�А���"��C��{k��_�0�J�_���	{v��
ᔱ�+����H���Z�7����*ZH�P���׺'޵�S��m�4�/):M�      �      x������ � �      �   x   x���1
�0k�����.F��`C�&������R�f��aX�@��u�Ds�^�2O�}����p:�$p�[�BR���ֲ=��*H�k��Z3+�#��p�Z�л�ɒ((Gk�1�7�/<      �   �  x���M��@ ����S�!ם̋���5qI\%�6PX|�U��o5�ӷ��B���s���� ��.����>�j��**$LT�$�c2?2�~G=Tz��J�N����X�I"����>E�I]�����z�>tE��`��� &��2�(I�
ѾeC�Fu"@"�#��������s��8�G��gd
�{)?�{�إ#��ʽ�����\�g{�e~U$7��1��l[v��K���E8�5�:I�&�ҊxͰ��e�.w�s�ރ��k������~cn��5�Ex,��35������	)��P��#K�k���Me����Ч�z%����0����T��~�]�񵆽%Y{��gb�2�Լ��&[��Ʊw���?��_��%��ܢ2�s���/p6�}V���     