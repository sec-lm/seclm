from setuptools import setup

setup(
    name='seclm',
    version='0.1.1',
    description='seclm',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    author='stneng',
    author_email='git@stneng.com',
    url='https://github.com/sec-lm/seclm',
    packages=['seclm', 'seclm.ssl'],
    install_requires=[
        'cryptography'
    ],
    python_requires='>=3.10',
)
